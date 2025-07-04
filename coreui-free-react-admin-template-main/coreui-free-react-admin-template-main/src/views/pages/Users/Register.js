import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'   // 👈 para usar logout()

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '', role: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const { logout } = useAuth()            // 👈 obtenemos logout del contexto

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.username || !form.password || !form.role) {
      setError('Todos los campos son obligatorios.')
      return
    }

    try {
      console.log('🛂 Token en localStorage:', localStorage.getItem('token'))
      await api.post('/users', form)      // token se envía automáticamente
      setSuccess(true)
      setForm({ username: '', password: '', role: '' })
    } catch (err) {
      if (err.response?.status === 401) {
        // ⚠️ token expirado o usuario sin permisos
        setError('Sesión expirada o sin permisos para registrar. Inicia sesión nuevamente.')
        logout()                         // cerramos sesión
        setTimeout(() => navigate('/login'), 1500) // redirige al login tras 1.5 s
      } else {
        setError(err.response?.data?.message || 'Error al registrar usuario.')
      }
    }
  }

  const handleCancel = () => navigate(-1)

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCardGroup>
            <CCard className="p-4">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <h1>Registro</h1>
                  <p className="text-medium-emphasis">Crear una nueva cuenta</p>

                  {success && (
                    <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                      Usuario creado correctamente.
                    </CAlert>
                  )}
                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </CAlert>
                  )}

                  {/* Username */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={iconSet.cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* Password */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={iconSet.cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* Role */}
                  <CInputGroup className="mb-4">
                    <CInputGroupText>Role</CInputGroupText>
                    <CFormSelect
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un rol...</option>
                      <option value="Admin">Admin</option>
                      <option value="Agricultor">Agricultor</option>
                    </CFormSelect>
                  </CInputGroup>

                  <CRow>
                    <CCol xs={6}>
                      <CButton type="submit" color="primary" className="px-4">
                        Registrar
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-end">
                      <CButton color="secondary" variant="outline" className="px-4" onClick={handleCancel}>
                        Cancelar
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Register
