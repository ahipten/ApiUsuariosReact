// src/views/sensores/SensorDelete.jsx
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

const SensorDelete = () => {
  const [sensores, setSensores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [selected, setSelected] = useState(null) // sensor seleccionado
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const { logout } = useAuth()
  const navigate = useNavigate()

  /* ─────────── Cargar sensores y usuarios ─────────── */
  const fetchData = async () => {
    try {
      const [sensorRes, userRes] = await Promise.all([
        api.get('/sensores'),
        api.get('/users'),
      ])
      setSensores(sensorRes.data)
      setUsuarios(userRes.data)
    } catch {
      setError('Error al cargar sensores.')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ─────────── Seleccionar para eliminar ─────────── */
  const confirmDelete = (sensor) => {
    setSelected(sensor)
    setSuccess(null)
  }

  /* ─────────── Eliminar sensor ─────────── */
  const handleDelete = async () => {
    if (!selected) return

    try {
      await api.delete(`/sensores/${selected.id}`)
      setSuccess('Sensor eliminado correctamente.')
      setSelected(null)
      fetchData()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos para eliminar.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError('Error al eliminar el sensor.')
      }
    }
  }

  const handleReturn = () => navigate(-1)

  /* ─────────── Helper para mostrar username ─────────── */
  const getUsername = (userId) => usuarios.find(u => u.id === userId)?.username || '—'

  return (
    <CContainer>
      <h2 className="mb-4">Sensores</h2>

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

      {/* Tabla de sensores */}
      <CTable hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Código</CTableHeaderCell>
            <CTableHeaderCell>Ubicación</CTableHeaderCell>
            <CTableHeaderCell>Usuario</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {sensores.map((s) => (
            <CTableRow key={s.id}>
              <CTableDataCell>{s.id}</CTableDataCell>
              <CTableDataCell>{s.codigo}</CTableDataCell>
              <CTableDataCell>{s.ubicacion}</CTableDataCell>
              <CTableDataCell>{getUsername(s.usuarioId)}</CTableDataCell>
              <CTableDataCell>
                <CButton color="danger" size="sm" onClick={() => confirmDelete(s)}>
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
                  ¿Seguro que deseas eliminar el sensor <strong>{selected.codigo}</strong> (ID {selected.id})?
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

      {/* Botón volver cuando no hay seleccionado */}
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

export default SensorDelete
