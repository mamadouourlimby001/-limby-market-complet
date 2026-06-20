import axios from 'axios';
import { getToken, removeToken, removeStoredUser } from './storage';
import { resetToLogin } from '../navigation/navigationRef';

// Équivalent exact de frontend/src/utils/api.js : même baseURL de repli, même
// logique d'intercepteurs (Bearer + purge sur 401), aucune route additionnelle.
const api = axios.create({
  baseURL: 'https://limby01-1.onrender.com/api',
  timeout: 60000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
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
    if (error.response && error.response.status === 401) {
      await removeToken();
      await removeStoredUser();
      resetToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
