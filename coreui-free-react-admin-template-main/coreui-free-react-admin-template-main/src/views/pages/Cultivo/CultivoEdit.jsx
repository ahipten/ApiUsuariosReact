import React, { useState, useEffect } from 'react'
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
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'

const CultivoEdit = () => {
  const [form, setForm] = useState({ nombre: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const fetchCultivo = async () => {
      try {
        const { data } = await api.get(`/cultivos/${id}`)
        setForm({ nombre: data.nombre })
      } catch (err) {
        setError('Error al cargar los datos del cultivo.')
      }
    }

    fetchCultivo()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.nombre) {
      setError('El nombre del cultivo es obligatorio.')
      return
    }

    try {
      await api.put(`/cultivos/${id}`, { id: parseInt(id), ...form })
      setSuccess(true)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos. Inicia sesión nuevamente.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(err.response?.data?.message || 'Error al actualizar cultivo.')
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
                  <h1>Editar Cultivo</h1>
                  <p className="text-medium-emphasis">Modificar información del cultivo</p>

                  {success && (
                    <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                      Cultivo actualizado correctamente.
                    </CAlert>
                  )}
                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </CAlert>
                  )}

                  {/* Nombre */}
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
                        Guardar
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

export default CultivoEdit
