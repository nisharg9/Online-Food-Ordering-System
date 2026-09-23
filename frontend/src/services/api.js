// services/api.js
// Axios instance with base URL, JWT interceptors, and global error handling
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─────────────────────────────────────────────
// Request interceptor: attach JWT token to every request
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blushbites_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────
// Response interceptor: handle 401 (auto logout) and normalize errors
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('blushbites_token');
      localStorage.removeItem('blushbites_user');
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth?session=expired';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
