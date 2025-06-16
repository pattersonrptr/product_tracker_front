import axiosInstance from './axiosConfig';

const apiService = {
    get: async (url, params = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw error;
        }
    },

    post: async (url, data = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(url, data, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error(`Error posting data to ${url}:`, error);
            throw error;
        }
    },

    put: async (url, data = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.put(url, data, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating data at ${url}:`, error);
            throw error;
        }
    },

    delete: async (url, data = {}) => {
        try {
            const token = localStorage.getItem('token');
             const config = {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
             };
            if (data && Object.keys(data).length) {
                config.data = data;
            }
            const response = await axiosInstance.delete(url, config);
            return response.data;
        } catch (error) {
            console.error(`Error deleting data from ${url}:`, error);
            throw error;
        }
    }
};

export default apiService;
