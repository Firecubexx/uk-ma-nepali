import axios from 'axios';

// ✅ USE YOUR BACKEND URL FROM ENV
const api = axios.create({
  baseURL: 'https://uk-ma-nepali-1.onrender.com/api'
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