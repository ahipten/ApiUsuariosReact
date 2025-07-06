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
import { useAuth } from '../../../context/AuthContext'

const LecturaRegister = () => {
  const [form, setForm] = useState({
    sensorId: '',
    cultivoId: '',
    fecha: '',
    humedadSuelo: '',
    temperatura: '',
    precipitacion: '',
    viento: '',
    radiacionSolar: '',
    etapaCultivo: '',
    necesitaRiego: false,
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      await api.post('/lecturas', form)
      setSuccess(true)
      setForm({
        sensorId: '',
        cultivoId: '',
        fecha: '',
        humedadSuelo: '',
        temperatura: '',
        precipitacion: '',
        viento: '',
        radiacionSolar: '',
        etapaCultivo: '',
        necesitaRiego: false,
      })
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Sesión expirada o sin permisos. Inicia sesión nuevamente.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(err.response?.data?.message || 'Error al registrar la lectura.')
      }
    }
  }

  const handleCancel = () => navigate(-1)

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={10}>
          <CCardGroup>
            <CCard className="p-4">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <h1>Registrar Lectura</h1>
                  <p className="text-medium-emphasis">Agregar nueva lectura de sensor</p>

                  {success && (
                    <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                      Lectura creada correctamente.
                    </CAlert>
                  )}
                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </CAlert>
                  )}

                  {/* ID del sensor */}
                  <CInputGroup className="mb-2">
                    <CInputGroupText>ID Sensor</CInputGroupText>
                    <CFormInput
                      type="number"
                      name="sensorId"
                      value={form.sensorId}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* ID del cultivo */}
                  <CInputGroup className="mb-2">
                    <CInputGroupText>ID Cultivo</CInputGroupText>
                    <CFormInput
                      type="number"
                      name="cultivoId"
                      value={form.cultivoId}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* Fecha */}
                  <CInputGroup className="mb-2">
                    <CInputGroupText>Fecha</CInputGroupText>
                    <CFormInput
                      type="datetime-local"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* Variables ambientales */}
                  {['humedadSuelo', 'temperatura', 'precipitacion', 'viento', 'radiacionSolar'].map((field) => (
                    <CInputGroup className="mb-2" key={field}>
                      <CInputGroupText>{field}</CInputGroupText>
                      <CFormInput
                        type="number"
                        step="0.01"
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                  ))}

                  {/* Etapa de cultivo */}
                  <CInputGroup className="mb-2">
                    <CInputGroupText>Etapa Cultivo</CInputGroupText>
                    <CFormInput
                      name="etapaCultivo"
                      value={form.etapaCultivo}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* ¿Necesita riego? */}
                  <CInputGroup className="mb-4">
                    <CInputGroupText>¿Necesita Riego?</CInputGroupText>
                    <CFormSelect
                      name="necesitaRiego"
                      value={form.necesitaRiego.toString()}
                      onChange={handleChange}
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
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

export default LecturaRegister
