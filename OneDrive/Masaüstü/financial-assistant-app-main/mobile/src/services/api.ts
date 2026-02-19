import axios from 'axios';
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    clearTokens,
} from './secureStore';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();

        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getRefreshToken();

                if (!refreshToken) {
                    await clearTokens();
                    return Promise.reject(error);
                }

                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken }
                );

                const newAccessToken = refreshResponse.data?.accessToken;

                if (newAccessToken) {
                    await setAccessToken(newAccessToken);

                    originalRequest.headers = originalRequest.headers ?? {};
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    return api(originalRequest);
                }

                await clearTokens();
                return Promise.reject(error);
            } catch (refreshError) {
                await clearTokens();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);