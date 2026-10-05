import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    const url = e.config?.url || '';
    const isAuthForm = url.startsWith('/auth/login') || url.startsWith('/auth/register');
    if (e.response?.status === 401 && !isAuthForm) {
      localStorage.clear();
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(e);
  }
);

export const errMsg = (e) => e.response?.data?.message || e.message;
export default api;