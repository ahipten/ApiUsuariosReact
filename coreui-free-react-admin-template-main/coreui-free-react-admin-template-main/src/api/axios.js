// src/api/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    // Evita mostrar advertencia si la solicitud es de login o registro
    const isAuthRoute = config.url.includes('/auth/login') || config.url.includes('/auth/register')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token añadido al header.')
    } else if (!isAuthRoute) {
      console.warn('⚠️ No se encontró token en localStorage')
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default api
