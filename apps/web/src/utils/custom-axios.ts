import axios from 'axios';

import storage from '@/helpers/storage';

const customAxios = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', // port BE, will be changed later when BE is ready
  baseURL: '/api', // same-origin proxy to avoid CORS issues during development
  withCredentials: true,
});

customAxios.interceptors.request.use(
  (config) => {
    const token: string | null = storage.getItem('token');
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error('Error in axios');
    Promise.reject(error);
  },
);

export default customAxios;
