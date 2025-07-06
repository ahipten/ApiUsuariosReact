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
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'

const CultivoCreate = () => {
  const [form, setForm] = useState({ nombre: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.nombre) {
      setError('El campo nombre es obligatorio.')
      return
    }

    try {
      await api.post('/cultivos', form)
      setSuccess(true)
      setForm({ nombre: '' })
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos. Inicia sesión nuevamente.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(err.response?.data?.message || 'Error al registrar cultivo.')
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
                  <h1>Registrar Cultivo</h1>
                  <p className="text-medium-emphasis">Agregar un nuevo cultivo al sistema</p>

                  {success && (
                    <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                      Cultivo creado correctamente.
                    </CAlert>
                  )}
                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </CAlert>
                  )}

                  {/* Nombre del cultivo */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={iconSet.cilLeaf} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nombre del cultivo"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
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

export default CultivoCreate
