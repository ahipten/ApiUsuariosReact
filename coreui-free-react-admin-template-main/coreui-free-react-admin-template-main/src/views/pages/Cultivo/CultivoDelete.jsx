// src/views/pages/Cultivo/CultivoDelete.jsx
import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const CultivoDelete = () => {
  const [cultivos, setCultivos] = useState([])
  const [selected, setSelected] = useState(null) // cultivo seleccionado para eliminar
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const fetchCultivos = async () => {
    try {
      const { data } = await api.get('/cultivos')
      setCultivos(data)
    } catch {
      setError('Error al cargar cultivos.')
    }
  }

  useEffect(() => {
    fetchCultivos()
  }, [])

  const confirmDelete = (cultivo) => {
    setSelected(cultivo)
    setSuccess(null)
  }

  const handleDelete = async () => {
    if (!selected) return

    try {
      await api.delete(`/cultivos/${selected.id}`)
      setSuccess('Cultivo eliminado correctamente.')
      setSelected(null)
      fetchCultivos()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos para eliminar.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError('Error al eliminar el cultivo.')
      }
    }
  }

  const handleReturn = () => navigate(-1)

  return (
    <CContainer>
      <h2 className="mb-4">Cultivos</h2>

      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </CAlert>
      )}

      {/* Tabla de cultivos */}
      <CTable hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {cultivos.map((c) => (
            <CTableRow key={c.id}>
              <CTableDataCell>{c.id}</CTableDataCell>
              <CTableDataCell>{c.nombre}</CTableDataCell>
              <CTableDataCell>
                <CButton color="danger" size="sm" onClick={() => confirmDelete(c)}>
                  Eliminar
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Sección de confirmación */}
      {selected && (
        <CRow className="justify-content-center mt-5">
          <CCol md={6}>
            <CCard>
              <CCardBody>
                <h5>Confirmar eliminación</h5>
                <p>
                  ¿Seguro que deseas eliminar el cultivo <strong>{selected.nombre}</strong> (ID {selected.id})?
                </p>
                <CRow className="mb-2">
                  <CCol xs={6}>
                    <CButton color="danger" onClick={handleDelete} className="px-4">
                      Confirmar
                    </CButton>
                  </CCol>
                  <CCol xs={6} className="text-end">
                    <CButton
                      color="secondary"
                      variant="outline"
                      onClick={() => setSelected(null)}
                      className="px-4"
                    >
                      Cancelar
                    </CButton>
                  </CCol>
                </CRow>
                <CButton color="secondary" onClick={handleReturn}>Volver</CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {!selected && (
        <CRow className="mt-4">
          <CCol className="text-end">
            <CButton color="secondary" onClick={handleReturn}>Volver</CButton>
          </CCol>
        </CRow>
      )}
    </CContainer>
  )
}

export default CultivoDelete
