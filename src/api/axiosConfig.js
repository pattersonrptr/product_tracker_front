import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const baseURL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

let onSessionExpiredCallback = null;
let onTokenRemovedCallback = null;
let onAuthTokenUpdatedCallback = null;

export const setSessionExpiredCallback = (callback) => {
    onSessionExpiredCallback = callback;
};

export const setTokenRemovedCallback = (callback) => {
    onTokenRemovedCallback = callback;
};

export const setAuthTokenUpdatedCallback = (callback) => {
    onAuthTokenUpdatedCallback = callback;
};


const processQueue = (error, token = null) => {
    failedQueue.forEach(promObj => {
        if (error) {
            promObj.reject(error);
        } else {
            promObj.resolve(token);
        }
    });
    failedQueue = [];
};

async function refreshAccessToken() {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    console.log("Making actual refresh token request...");

    try {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            isRefreshing = false;
            processQueue(new Error("No token found for refresh."));
            console.log("Token was already removed from localStorage, refresh skipped.");
            return Promise.reject(new Error("No token found for refresh."));
        }

        const response = await axios.post(`${baseURL}/auth/refresh-token`, {}, {
            headers: {
                Authorization: `Bearer ${currentToken}`
            }
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('token', newAccessToken);
        console.log("Token refreshed successfully.");

        if (onAuthTokenUpdatedCallback) {
            onAuthTokenUpdatedCallback(newAccessToken);
        }

        isRefreshing = false;
        processQueue(null, newAccessToken);
        return newAccessToken;

    } catch (error) {
        console.error("Token refresh failed:", error);
        isRefreshing = false;
        processQueue(error);

        if (onSessionExpiredCallback && localStorage.getItem('token')) {
             onSessionExpiredCallback('Your session has expired. Please log in again.');
        } else if (!localStorage.getItem('token')) {
            console.log("AuthContext already handled session expiration or token removal.");
        }
        return Promise.reject(error);
    }
}


axiosInstance.interceptors.request.use(
    async config => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

            try {
                const decodedToken = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const refreshThreshold = 15 * 60 * 1000;

                if (expirationTime - Date.now() < refreshThreshold && !config._isRetry) {
                    console.log("Token is close to expiration. Attempting refresh.");
                    try {
                        const newToken = await refreshAccessToken();
                        config.headers.Authorization = `Bearer ${newToken}`;
                        config._isRetry = true;
                    } catch (refreshError) {
                        console.error("Failed to refresh token before request (from request interceptor):", refreshError);
                        return Promise.reject(refreshError);
                    }
                }
            } catch (error) {
                console.error("Error decoding token or token is invalid (from request interceptor):", error);
                if (onSessionExpiredCallback) {
                    onSessionExpiredCallback('Invalid token in local storage. Please log in again.');
                }
                return Promise.reject(error);
            }
        } else {
            console.log("No token found in localStorage for this request. Skipping Authorization header.");
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const status = error.response ? error.response.status : null;

        if (status === 401 && !originalRequest._isRetry && originalRequest.url !== `${baseURL}/auth/refresh-token`) {
            originalRequest._isRetry = true;

            const currentTokenForRetry = localStorage.getItem('token');
            if (currentTokenForRetry && !isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });

                    refreshAccessToken().catch(err => {
                        console.error("Refresh failed in response interceptor (initiator):", err);
                    });
                });
            } else {
                console.log("Token already removed or refresh in progress. Not attempting refresh on 401.");
                if (onSessionExpiredCallback) {
                    onSessionExpiredCallback('Your session has expired. Please log in again.');
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
