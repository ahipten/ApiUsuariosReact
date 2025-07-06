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
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'

const LecturaEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

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

  useEffect(() => {
    const fetchLectura = async () => {
      try {
        const response = await api.get(`/lecturas/${id}`)
        const lectura = response.data

        // Formatear fecha a input datetime-local
        const fechaISO = new Date(lectura.fecha).toISOString().slice(0, 16)

        setForm({ ...lectura, fecha: fechaISO })
      } catch (err) {
        setError('Error al cargar la lectura.')
      }
    }

    fetchLectura()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    const newValue = type === 'select-one' && name === 'necesitaRiego' ? value === 'true' : value
    setForm({ ...form, [name]: newValue })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      await api.put(`/lecturas/${id}`, form)
      setSuccess(true)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Sesión expirada o sin permisos. Inicia sesión nuevamente.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(err.response?.data?.message || 'Error al actualizar la lectura.')
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
                  <h1>Editar Lectura</h1>
                  <p className="text-medium-emphasis">Modificar los datos de la lectura</p>

                  {success && (
                    <CAlert color="success" dismissible onClose={() => setSuccess(false)}>
                      Lectura actualizada correctamente.
                    </CAlert>
                  )}
                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </CAlert>
                  )}

                  {/* Campos */}
                  {[
                    ['sensorId', 'ID Sensor'],
                    ['cultivoId', 'ID Cultivo'],
                    ['fecha', 'Fecha', 'datetime-local'],
                    ['humedadSuelo', 'Humedad Suelo'],
                    ['temperatura', 'Temperatura'],
                    ['precipitacion', 'Precipitación'],
                    ['viento', 'Viento'],
                    ['radiacionSolar', 'Radiación Solar'],
                    ['etapaCultivo', 'Etapa Cultivo'],
                  ].map(([name, label, type = 'text']) => (
                    <CInputGroup className="mb-2" key={name}>
                      <CInputGroupText>{label}</CInputGroupText>
                      <CFormInput
                        type={type}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                  ))}

                  {/* ¿Necesita Riego? */}
                  <CInputGroup className="mb-4">
                    <CInputGroupText>¿Necesita Riego?</CInputGroupText>
                    <CFormSelect
                      name="necesitaRiego"
                      value={form.necesitaRiego?.toString()}
                      onChange={handleChange}
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </CFormSelect>
                  </CInputGroup>

                  <CRow>
                    <CCol xs={6}>
                      <CButton type="submit" color="primary" className="px-4">
                        Guardar Cambios
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

export default LecturaEdit
