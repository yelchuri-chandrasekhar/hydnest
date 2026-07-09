// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Separate instance for the Java search microservice (public, no auth needed)
export const searchApi = axios.create({
  baseURL: 'http://localhost:8081/api',
});

export default api;