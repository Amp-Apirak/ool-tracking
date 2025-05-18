// src/axiostoastapi.js

import axios from 'axios';
import { clearStorage } from '@/auth.js';
import { toast } from 'vue3-toastify';
import { useTokenStore } from '@/stores/token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT
});

const BASE_PATH = import.meta.env.VITE_APP_BASE_PATH || '/';
const PORTAL_LOGIN_URL = import.meta.env.VITE_PORTAL_LOGIN_URL || '/';

// Intercept request: attach JWT if available
api.interceptors.request.use(
    (config) => {
        const tokenStore = useTokenStore();
        const token = tokenStore.getApiToken();

        if (token && !config.noAuth) {
            const isValid = tokenStore.isTokenValid(token, 20); // 20 sec safety margin
            if (!isValid) {
                toast.error('Session expired. Please login again.');
                clearStorage();
                //window.location.href = BASE_PATH;
                window.location.href = PORTAL_LOGIN_URL;
                return Promise.reject(new Error('Token expired'));
            }

            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept response: handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            toast.error('Session expired or unauthorized access.');
            clearStorage();
            //window.location.href = BASE_PATH;
            window.location.href = PORTAL_LOGIN_URL; // ✅ Redirect ไป Portal
        }
        return Promise.reject(error);
    }
);

export default api;
