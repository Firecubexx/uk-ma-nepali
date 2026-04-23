import axios from 'axios';
import { getApiBaseUrl } from './helpers';

const api = axios.create({
  baseURL: getApiBaseUrl()
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('umn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('umn_token');
      localStorage.removeItem('umn_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
