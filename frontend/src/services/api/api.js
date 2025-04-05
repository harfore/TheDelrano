// exports axios instances for different API endpoints with request/response interceptors and typed methods for consistent API consumption
// features:
// - Base URL configuration with environment variable fallbacks
// - Automatic JWT token injection for authenticated requests
// - Global 401 unauthorized response handling
// - Pre-configured timeout and content-type headers
// - Modular API endpoint organization

import axios from 'axios';

// @param {string} baseURL - The base URL for all requests from this instance
const createApiInstance = (baseURL) => {
    const instance = axios.create({
        baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false
    });

    // request interceptor - injects auth token if present
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    // response interceptor - handles global error responses
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            // redirect to login on 401 Unauthorized
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export const eventsApi = createApiInstance(
    import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3000/api/events'
);

// environment-configured API endpoints with local fallbacks
const baseURLs = {
    auth: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api/auth',
    data: import.meta.env.VITE_DATA_API_URL || 'http://localhost:3000/api/data',
    payment: import.meta.env.VITE_PAYMENT_API_URL || 'https://api.paymentprovider.com/v1'
};

// Pre-configured API instances for different services
export const authApi = createApiInstance(baseURLs.auth);
export const dataApi = createApiInstance(baseURLs.data);
export const paymentApi = createApiInstance(baseURLs.payment);

export const api = {
    auth: {
        login: (credentials) => authApi.post('/login', credentials),
        register: (userData) => authApi.post('/register', userData)
    },
    data: {
        fetchAll: (params) => dataApi.get('', { params }),
        getById: (id) => dataApi.get(`/${id}`)
    }
};

// 6° typeScript support (if using)
/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} [status] - HTTP status code
 */