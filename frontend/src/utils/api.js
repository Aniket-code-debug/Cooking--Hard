import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Track if server is warmed up
let isServerWarm = false;
let wakeupCallbacks = [];

// Create axios instance with interceptors
const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds for cold starts
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request start time
        config.metadata = { startTime: new Date() };

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        const duration = new Date() - response.config.metadata.startTime;

        // If response is fast, server is warm
        if (duration < 3000) {
            isServerWarm = true;
        }

        // Hide wakeup message if shown
        wakeupCallbacks.forEach(cb => cb(false));

        return response;
    },
    (error) => {
        // Hide wakeup message on error
        wakeupCallbacks.forEach(cb => cb(false));

        return Promise.reject(error);
    }
);

// Add slow request handler
const createSlowRequestHandler = (showWakeupMessage) => {
    return (config) => {
        // If server is already warm, don't show message
        if (isServerWarm) {
            return config;
        }

        // Show wakeup message after 5 seconds
        const timer = setTimeout(() => {
            showWakeupMessage(true);
        }, 5000);

        // Store original request
        const originalRequest = config.adapter;

        config.adapter = function (resolve) {
            clearTimeout(timer);
            return originalRequest(resolve);
        };

        return config;
    };
};

// Register wakeup callback
export const registerWakeupCallback = (callback) => {
    wakeupCallbacks.push(callback);
    return () => {
        wakeupCallbacks = wakeupCallbacks.filter(cb => cb !== callback);
    };
};

// Check if server is warm
export const checkServerWarmth = () => isServerWarm;

// Manual warmup (optional)
export const warmupServer = async () => {
    try {
        await api.get('/api/health'); // Assuming you have a health endpoint
        isServerWarm = true;
        return true;
    } catch (error) {
        console.error('Warmup failed:', error);
        return false;
    }
};

export default api;
