import axios from 'axios';

// Get guest session ID from localStorage or generate new one
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('naik_smartshop_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('naik_smartshop_session_id', sessionId);
  }
  return sessionId;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token & Session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naik_smartshop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-session-id'] = getOrCreateSessionId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
