// src/views/pages/Cultivo/CultivoEdit.jsx
import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const CultivoEdit = () => {
  const [cultivos, setCultivos] = useState([])
  const [form, setForm] = useState({ id: null, nombre: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { logout } = useAuth()
  const navigate = useNavigate()

  const fetchCultivos = async () => {
    try {
      const { data } = await api.get('/cultivos')
      setCultivos(data)
    } catch (err) {
      setError('No se pudieron cargar los cultivos.')
    }
  }

  useEffect(() => {
    fetchCultivos()
  }, [])

  const handleEditClick = (cultivo) => {
    setForm({ id: cultivo.id, nombre: cultivo.nombre })
    setSuccess(false)
    setError(null)
  }

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
      await api.put(`/cultivos/${form.id}`, form)
      setSuccess(true)
      setForm({ id: null, nombre: '' })
      fetchCultivos()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos. Inicia sesión nuevamente.')
        logout()
      } else {
        setError(err.response?.data?.message || 'Error al actualizar cultivo.')
      }
    }
  }

  const handleReturn = () => navigate(-1)

  return (
    <CContainer>
      <h2 className="mb-4">Lista de Cultivos</h2>
      <CTable hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {cultivos.map((cultivo) => (
            <CTableRow key={cultivo.id}>
              <CTableDataCell>{cultivo.id}</CTableDataCell>
              <CTableDataCell>{cultivo.nombre}</CTableDataCell>
              <CTableDataCell>
                <CButton size="sm" color="warning" onClick={() => handleEditClick(cultivo)}>
                  Editar
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CRow className="justify-content-center mt-5">
        <CCol md={8}>
          <CCard className="p-4">
            <CCardBody>
              <h4>Editar Cultivo</h4>

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

              <CForm onSubmit={handleSubmit}>
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
                    <CButton type="submit" color="primary" disabled={!form.id}>
                      Guardar Cambios
                    </CButton>
                  </CCol>
                  <CCol xs={6} className="text-end">
                    <CButton
                      color="secondary"
                      variant="outline"
                      onClick={() => setForm({ id: null, nombre: '' })}
                    >
                      Cancelar
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>

              <CRow className="mt-3">
                <CCol className="text-end">
                  <CButton color="secondary" onClick={handleReturn}>
                    Volver
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default CultivoEdit
