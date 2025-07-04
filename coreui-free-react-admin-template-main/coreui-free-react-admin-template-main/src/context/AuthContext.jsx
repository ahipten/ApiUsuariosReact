import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

const AuthContext = createContext(null)

// 🔐 Verifica expiración del token
const isExpired = (token) => {
  try {
    const { exp } = jwtDecode(token)
    return Date.now() >= exp * 1000 - 30000 // 30s de tolerancia
  } catch {
    return true
  }
}


// 🔐 Verifica issuer y audiencia si se requiere
const isValidClaims = (token) => {
  try {
    const { iss, aud } = jwtDecode(token)
    return iss === 'RiegoAPI' && aud === 'RiegoUsers'
  } catch {
    return false
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token')
    if (!stored || isExpired(stored) || !isValidClaims(stored)) {
      localStorage.removeItem('token')
      return null
    }
    setUser(jwtDecode(stored))
    return stored
  })

  // 🟢 Login
const login = async (username, password) => {
  try {
    const { data } = await api.post('/auth/login', { username, password })

    if (!data?.token || typeof data.token !== 'string' || !data.token.includes('.')) {
      throw new Error('Token JWT inválido.')
    }

    if (isExpired(data.token) || !isValidClaims(data.token)) {
      throw new Error('El token recibido no es válido o ya expiró.')
    }

    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(jwtDecode(data.token))

    console.log('✅ Token guardado en localStorage')
    return true // <- indica éxito
  } catch (err) {
    console.error('Error en login:', err.message)
    throw err
  }
}

  // 🔴 Logout
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // 🔄 Sincronizar entre pestañas
  useEffect(() => {
    const syncStorage = () => {
      const t = localStorage.getItem('token')
      if (!t || isExpired(t) || !isValidClaims(t)) {
        logout()
      } else {
        setToken(t)
        setUser(jwtDecode(t))
      }
    }
    window.addEventListener('storage', syncStorage)
    return () => window.removeEventListener('storage', syncStorage)
  }, [])

  // ⚠️ Interceptor global para manejar 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          console.warn('Token expirado o inválido. Cerrando sesión automáticamente.')
          logout()
        }
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(interceptor)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
