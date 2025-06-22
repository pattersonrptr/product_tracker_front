import apiService from '../../api/apiService';
import axiosInstance from '../../api/axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(() => ({ exp: Date.now() / 1000 + 3600 })) // Mock a valid token
}));

describe('apiService', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axiosInstance);
        localStorage.setItem('token', 'test_token');
        jwtDecode.mockClear();
    });

    afterEach(() => {
        mock.restore();
        localStorage.clear();
    });

    it('should make a GET request', async () => {
        const url = '/test';
        const params = { param1: 'value1' };
        const mockResponse = { data: 'test data' };

        mock.onGet(url, { params: params, headers: { 'Authorization': 'Bearer test_token' } }).reply(200, mockResponse);

        const response = await apiService.get(url, params);
        expect(response).toEqual(mockResponse);
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in GET requests', async () => {
        const url = '/test';
        mock.onGet(url).reply(500, 'Server error');

        await expect(apiService.get(url)).rejects.toThrow("Request failed with status code 500");
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

    it('should make a POST request', async () => {
        const url = '/test';
        const data = { key: 'value' };
        const mockResponse = { success: true };

        mock.onPost(url).reply(config => {
            expect(JSON.parse(config.data)).toEqual(data);
            expect(config.headers['Authorization']).toEqual('Bearer test_token');
            expect(config.headers['Content-Type']).toEqual('application/json');
            return [200, mockResponse];
        });

        const response = await apiService.post(url, data);
        expect(response).toEqual(mockResponse);
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in POST requests', async () => {
        const url = '/test';
        const data = { key: 'value' };
        mock.onPost(url).reply(config => {
            expect(JSON.parse(config.data)).toEqual(data);
            expect(config.headers['Authorization']).toEqual('Bearer test_token');
            expect(config.headers['Content-Type']).toEqual('application/json');
            return [400, 'Bad Request'];
        });

        await expect(apiService.post(url, data)).rejects.toThrow("Request failed with status code 400");
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

    it('should make a PUT request', async () => {
        const url = '/test';
        const data = { key: 'value' };
        const mockResponse = { success: true };

        mock.onPut(url).reply(config => {
            expect(JSON.parse(config.data)).toEqual(data);
            expect(config.headers['Authorization']).toEqual('Bearer test_token');
            expect(config.headers['Content-Type']).toEqual('application/json');
            return [200, mockResponse];
        });

        const response = await apiService.put(url, data);
        expect(response).toEqual(mockResponse);
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in PUT requests', async () => {
        const url = '/test';
        const data = { key: 'value' };
        mock.onPut(url).reply(config => {
            expect(JSON.parse(config.data)).toEqual(data);
            expect(config.headers['Authorization']).toEqual('Bearer test_token');
            expect(config.headers['Content-Type']).toEqual('application/json');
            return [404, 'Not Found'];
        });

        await expect(apiService.put(url, data)).rejects.toThrow("Request failed with status code 404");
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

   it('should make a DELETE request', async () => {
        const url = '/test';
        const data = { id: 123 };
        const mockResponse = { success: true };

        mock.onDelete(url, {
            headers: {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            },
            data: data
        }).reply(200, mockResponse);

        const response = await apiService.delete(url, data);
        expect(response).toEqual(mockResponse);
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in DELETE requests', async () => {
        const url = '/test';
        const data = { id: 123 };
        mock.onDelete(url, { data: data }).reply(403, 'Forbidden');

        await expect(apiService.delete(url, data)).rejects.toThrow("Request failed with status code 403");
        expect(jwtDecode).toHaveBeenCalledTimes(1);
    });
});
