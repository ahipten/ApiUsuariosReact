// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

/* ---------------------------------- utils --------------------------------- */

// ¿El token está expirado? 30 s de tolerancia
const isExpired = (token) => {
  try {
    const { exp } = jwtDecode(token)
    return Date.now() >= exp * 1000 - 30_000
  } catch {
    return true
  }
}

// ¿Issuer y Audience son los correctos?
const isValidClaims = (token) => {
  try {
    const { iss, aud } = jwtDecode(token)
    return iss === 'RiegoAPI' && aud === 'RiegoUsers'
  } catch {
    return false
  }
}

/* ----------------------------- context setup ------------------------------ */

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  /* ----------------------------- estado local ----------------------------- */
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

  /* ------------------------------ LOGIN ----------------------------------- */
  const login = async (username, password) => {
    try {
      // petición al backend
      const { data } = await api.post('/auth/login', { username, password })

      // desestructuramos respuesta
      const { token: rawToken, username: userName, role } = data

      // validación mínima
      if (!rawToken || typeof rawToken !== 'string' || !rawToken.includes('.'))
        throw new Error('Token JWT inválido.')

      if (isExpired(rawToken) || !isValidClaims(rawToken))
        throw new Error('El token recibido no es válido o ya expiró.')

      // limpiamos posibles saltos de línea
      const cleanToken = rawToken.replace(/\r?\n|\r/g, '')

      // guardamos en localStorage
      localStorage.setItem('token', cleanToken)
      localStorage.setItem('username', userName)
      localStorage.setItem('role', role)

      // actualizamos estado global
      setToken(cleanToken)
      setUser(jwtDecode(cleanToken))

      console.log('✅ Token guardado en localStorage')
      return true
    } catch (err) {
      console.error('Error en login:', err.message)
      throw err
    }
  }

  /* ------------------------------ LOGOUT ---------------------------------- */
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    setToken(null)
    setUser(null)
  }

  /* ---------- sincronizar entre pestañas (evento storage) ----------------- */
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

  /* ---------------- interceptor global para 401 --------------------------- */
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          console.warn('Token expirado/invalidado – cerrando sesión.')
          logout()
        }
        return Promise.reject(err)
      },
    )
    return () => api.interceptors.response.eject(interceptor)
  }, [])

  /* --------------------------- contexto expuesto -------------------------- */
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
