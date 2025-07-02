import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
});

// Add JWT token to each request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token añadido al header:", token);
  } else {
    console.warn("⚠️ No se encontró token en localStorage");
  }
  return config;
});
export default api;
