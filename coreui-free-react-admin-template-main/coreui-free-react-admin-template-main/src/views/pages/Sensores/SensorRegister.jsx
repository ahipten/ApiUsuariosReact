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
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'

const SensorRegister = () => {
  const [form, setForm] = useState({ codigo: '', ubicacion: '', usuarioId: '' })
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/users')
      .then(res => setUsuarios(res.data))
      .catch(() => setError('Error al cargar usuarios.'))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.codigo || !form.ubicacion || !form.usuarioId) {
      setError('Todos los campos son obligatorios.')
      return
    }

    try {
      await api.post('/sensores', form)
      setSuccess(true)
      setForm({ codigo: '', ubicacion: '', usuarioId: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el sensor.')
    }
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CButton
            color="secondary"
            variant="outline"
            className="mb-3"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </CButton>

          <CCard className="p-4">
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <h1>Registrar Sensor</h1>

                {success && (
                  <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                    Sensor creado correctamente.
                  </CAlert>
                )}
                {error && (
                  <CAlert color="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </CAlert>
                )}

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
                      ...usuarios.map(u => ({ label: u.username, value: u.id }))
                    ]}
                  />
                </CInputGroup>

                <CRow>
                  <CCol xs={6}>
                    <CButton type="submit" color="primary" className="px-4">
                      Registrar
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default SensorRegister
