// axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`✅ Token añadido al header: ${token}`)
    } else {
      console.warn('⚠️ No se encontró token en localStorage')
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
