import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'opengym_access_token';

export const api = axios.create({
  baseURL: '/api/backend',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
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
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      Cookies.remove(TOKEN_KEY);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
