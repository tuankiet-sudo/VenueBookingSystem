import axios from 'axios';
import { createRoot } from 'react-dom/client';

import App from './app';
import { OpenAPI as OpenAPIConfig } from './generated/requests/core/OpenAPI';
import { useAuthStore } from './stores';
import './index.css';

OpenAPIConfig.BASE = 'https://venuebookingsystem.onrender.com';

// Use global axios interceptor for error handling since OpenAPI config doesn't support error interceptors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Use logout method which should exist on the store
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

createRoot(document.getElementById('root')!).render(<App />);
