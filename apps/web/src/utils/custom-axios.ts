import axios from 'axios';

import storage from '@/helpers/storage';

const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://venuebookingsystem.onrender.com', // port BE, will be changed later when BE is ready
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
