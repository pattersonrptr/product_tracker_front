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

export const setSessionExpiredCallback = (callback) => {
    onSessionExpiredCallback = callback;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

async function refreshAccessToken() {
    if (isRefreshing) {
        return new Promise(resolve => {
            failedQueue.push(token => {
                resolve(token);
            });
        });
    }

    isRefreshing = true;
    console.log("Making actual refresh token request...");

    try {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            if (onSessionExpiredCallback) {
                onSessionExpiredCallback('No token found. Please log in.');
            }
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

        isRefreshing = false;
        processQueue(null, newAccessToken);
        return newAccessToken;

    } catch (error) {
        console.error("Token refresh failed:", error);
        isRefreshing = false;
        processQueue(error);

        if (onSessionExpiredCallback) {
            onSessionExpiredCallback('Your session has expired. Please log in again.');
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
                const refreshThreshold = 30 * 1000;

                if (expirationTime - Date.now() < refreshThreshold && !config._isRetry) {
                    console.log("Token is close to expiration. Attempting refresh.");
                    try {
                        const newToken = await refreshAccessToken();
                        config.headers.Authorization = `Bearer ${newToken}`;
                        config._isRetry = true;
                    } catch (refreshError) {
                        console.error("Failed to refresh token before request:", refreshError);
                    }
                }
            } catch (error) {
                console.error("Error decoding token or token is invalid:", error);

                if (onSessionExpiredCallback) {
                    onSessionExpiredCallback('Invalid token in local storage. Please log in again.');
                }
                return Promise.reject(error);
            }
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

            return new Promise((resolve, reject) => {
                failedQueue.push(async (token) => {
                    if (token) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        try {
                            const retriedResponse = await axiosInstance(originalRequest);
                            resolve(retriedResponse);
                        } catch (retryError) {
                            reject(retryError);
                        }
                    } else {
                        reject(new Error("Token refresh failed."));
                    }
                });

                if (!isRefreshing) {
                    refreshAccessToken().catch(err => {
                        console.error("Refresh failed in response interceptor:", err);
                    });
                }
            });
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
