import axios from 'axios';
import { storage } from './storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Runs before every request — attach the token if we have one
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;