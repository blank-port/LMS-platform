import axios from 'axios';
import { toast } from 'react-toastify';

// Dynamic Backend URL for Full-Stack unified hosting
const backendUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001');

const api = axios.create({
    baseURL: backendUrl + '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Inject Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Safe Flattening & Common Error Handling
api.interceptors.response.use(
    (response) => {
        // Safe Flattening: Restore direct property access while preserving metadata
        if (response.data && response.data.success && response.data.data) {
            const { success, message, meta, status, data } = response.data;
            
            // If data is an object, we merge it into response.data
            // If it's a primitive or array, we still need to preserve top-level success/message/meta
            if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                response.data = {
                    ...data,
                    success,
                    message,
                    meta,
                    status
                };
            } else {
                // If it's an array or primitive, we keep it as a 'result' or just keep the structure
                // But most standardized backend endpoints return objects
                response.data = {
                    result: data,
                    success,
                    message,
                    meta,
                    status
                };
            }
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Institutional communication failure';
        
        // Handle Global Error Toasting (Optional: user suggested hybrid approach)
        // We'll toast only major system errors or if explicitly not handled by component
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // We don't force redirect here to avoid race conditions with React state, 
            // but we signal that auth is gone.
            if (!window.location.pathname.includes('/login')) {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            }
        } else if (error.response?.status >= 500) {
            toast.error(`System Error: ${message}`);
        }

        return Promise.reject(error);
    }
);

export default api;
