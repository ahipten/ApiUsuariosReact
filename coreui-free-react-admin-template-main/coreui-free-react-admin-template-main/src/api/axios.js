// src/api/axios.js
import axios from 'axios'

// 👉 Crea la instancia principal de Axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

// 🔎 Función auxiliar: ¿es un JWT bien formado?
const isValidJwt = (token) =>
  typeof token === 'string' &&
  token.split('.').length === 3 &&
  !token.includes('\n') &&
  !token.includes('\r')

// 🔐 Interceptor de solicitud: añade el token JWT si es válido
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token') || ''

    // 🔄 Limpieza adicional del token (comillas, saltos de línea)
    token = token.trim().replace(/^["']|["']$/g, '').replace(/\r?\n|\r/g, '')

    const isAuthRoute =
      config.url.includes('/auth/login') || config.url.includes('/auth/register')

    if (token && isValidJwt(token)) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`✅ JWT añadido al header. Longitud: ${token.length}`)
    } else if (!isAuthRoute) {
      console.warn('⚠️ Token ausente o malformado. No se añadió Authorization.')
    }

    return config
  },
  (error) => {
    console.error('❌ Error en interceptor de solicitud:', error)
    return Promise.reject(error)
  }
)

export default api
