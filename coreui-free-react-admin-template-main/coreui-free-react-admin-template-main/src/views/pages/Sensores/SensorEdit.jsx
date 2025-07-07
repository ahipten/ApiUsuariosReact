// src/views/sensores/SensorEdit.jsx
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
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'

const SensorEdit = () => {
  const [sensores, setSensores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ id: null, codigo: '', ubicacion: '', usuarioId: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()

  // Obtener sensores y usuarios
  const fetchData = async () => {
    try {
      const [sensorRes, userRes] = await Promise.all([
        api.get('/sensores'),
        api.get('/users'),
      ])
      setSensores(sensorRes.data)
      setUsuarios(userRes.data)
    } catch {
      setError('Error al cargar sensores o usuarios.')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEditClick = (sensor) => {
    setForm({
      id: sensor.id,
      codigo: sensor.codigo,
      ubicacion: sensor.ubicacion,
      usuarioId: sensor.usuarioId,
    })
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

    try {
      await api.put(`/sensores/${form.id}`, form)
      setSuccess(true)
      setForm({ id: null, codigo: '', ubicacion: '', usuarioId: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el sensor.')
    }
  }

  return (
    <CContainer>
      <h2 className="mb-4">Lista de Sensores</h2>
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
          {sensores.map((sensor) => {
            const usuario = usuarios.find(u => u.id === sensor.usuarioId)
            return (
              <CTableRow key={sensor.id}>
                <CTableDataCell>{sensor.id}</CTableDataCell>
                <CTableDataCell>{sensor.codigo}</CTableDataCell>
                <CTableDataCell>{sensor.ubicacion}</CTableDataCell>
                <CTableDataCell>{usuario?.username || '—'}</CTableDataCell>
                <CTableDataCell>
                  <CButton size="sm" color="warning" onClick={() => handleEditClick(sensor)}>
                    Editar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            )
          })}
        </CTableBody>
      </CTable>

      <CRow className="justify-content-center mt-5">
        <CCol md={8}>
          <CCard className="p-4">
            <CCardBody>
              <h4>Editar Sensor</h4>

              {success && (
                <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                  Sensor actualizado correctamente.
                </CAlert>
              )}
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </CAlert>
              )}

              <CForm onSubmit={handleSubmit}>
                <CInputGroup className="mb-3">
                  <CInputGroupText><CIcon icon={iconSet.cilMemory} /></CInputGroupText>
                  <CFormInput
                    placeholder="Código"
                    name="codigo"
                    value={form.codigo}
                    onChange={handleChange}
                    required
                  />
                </CInputGroup>

                <CInputGroup className="mb-3">
                  <CInputGroupText><CIcon icon={iconSet.cilLocationPin} /></CInputGroupText>
                  <CFormInput
                    placeholder="Ubicación"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    required
                  />
                </CInputGroup>

                <CInputGroup className="mb-4">
                  <CInputGroupText><CIcon icon={iconSet.cilUser} /></CInputGroupText>
                  <CFormSelect
                    name="usuarioId"
                    value={form.usuarioId}
                    onChange={handleChange}
                    required
                    options={[
                      { label: 'Seleccione un usuario', value: '' },
                      ...usuarios.map(u => ({ label: u.username, value: u.id })),
                    ]}
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
                      onClick={() => setForm({ id: null, codigo: '', ubicacion: '', usuarioId: '' })}
                    >
                      Cancelar
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>

              <CRow className="mt-3">
                <CCol className="text-end">
                  <CButton color="secondary" onClick={() => navigate(-1)}>
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

export default SensorEdit
