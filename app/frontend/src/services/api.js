import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Elnyomjuk az axios console hibákat
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('401') || args[0].includes('400') || args[0].includes('Unauthorized'))
  ) {
    return; // Ne logoljuk az auth hibákat
  }
  originalError.apply(console, args);
};

// Axios instance konfigurálása
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token hozzáadása minden kéréshez
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hibakezelés és token frissítés
api.interceptors.response.use(
  (response) => {
    // Automatikus token frissítés - ha a backend küld új tokent
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token lejárt vagy érvénytelen
      // Ne csináljunk automatikus átirányítást, csak távolítsuk el a tokent
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      // Login kérés esetén ne töröljük a tokent, mert nincs is még
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      // Ne logoljuk a hibát - az authService kezeli
    }
    return Promise.reject(error);
  }
);

export default api;
