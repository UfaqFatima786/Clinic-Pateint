import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

const api = axios.create({
  baseURL,
});

// attach JWT to every request
api.interceptors.request.use((config) => {
  if (!baseURL) {
    return Promise.reject(new Error('API is not configured. Set VITE_API_URL to your backend URL ending in /api.'));
  }
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (err) => err?.response?.data?.message || err.message || 'Something went wrong';

export default api;
