import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css' // Asegúrate de tener este archivo CSS
import { useAuth } from '../../../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null)

  try {
    const success = await login(username, password)
    if (success) {
      // Espera explícita para asegurar que el interceptor use el token
      setTimeout(() => {
        navigate('/')
      }, 100) // 100 ms suele ser suficiente
    }
  } catch (err) {
    setError('Credenciales inválidas')
  }
}

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>SmartIrrigation</h2>
          <p>Sistema de gestión agrícola inteligente</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ingrese su usuario"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingrese su contraseña"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
