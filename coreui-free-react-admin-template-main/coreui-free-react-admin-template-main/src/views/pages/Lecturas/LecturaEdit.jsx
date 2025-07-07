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

  const [sensores, setSensores] = useState([])
  const [cultivos, setCultivos] = useState([])

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  /* ─────────── Cargar lectura y listas ─────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturaRes, sensoresRes, cultivosRes] = await Promise.all([
          api.get(`/lecturas/${id}`),
          api.get('/sensores'),
          api.get('/cultivos'),
        ])

        const lectura = lecturaRes.data
        const fechaISO = new Date(lectura.fecha).toISOString().slice(0, 16)

        setForm({ ...lectura, fecha: fechaISO })
        setSensores(sensoresRes.data)
        setCultivos(cultivosRes.data)
      } catch (err) {
        setError('Error al cargar la lectura o listas de datos.')
      }
    }

    fetchData()
  }, [id])

  /* ─────────── Manejadores ─────────── */
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
      await api.put(`/lecturas/${id}`, {
        ...form,
        necesitaRiego: form.necesitaRiego === true || form.necesitaRiego === 'true',
      })
      setSuccess(true)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos. Inicia sesión nuevamente.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(err.response?.data?.message || 'Error al actualizar la lectura.')
      }
    }
  }

  const handleCancel = () => navigate(-1)

  /* ─────────── Render ─────────── */
  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={10}>
          <CCardGroup>
            <CCard className="p-4">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <h1>Editar Lectura</h1>
                  <p className="text-medium-emphasis">Modifica los datos registrados</p>

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

                  {/* Sensor */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Sensor</CInputGroupText>
                    <CFormSelect name="sensorId" value={form.sensorId} onChange={handleChange} required>
                      <option value="">Seleccione un sensor</option>
                      {sensores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.codigo} ({s.ubicacion})
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  {/* Cultivo */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Cultivo</CInputGroupText>
                    <CFormSelect name="cultivoId" value={form.cultivoId} onChange={handleChange} required>
                      <option value="">Seleccione un cultivo</option>
                      {cultivos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  {/* Fecha */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Fecha</CInputGroupText>
                    <CFormInput
                      type="datetime-local"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      required
                    />
                  </CInputGroup>

                  {/* Otros campos numéricos */}
                  {[
                    ['humedadSuelo', 'Humedad Suelo'],
                    ['temperatura', 'Temperatura'],
                    ['precipitacion', 'Precipitación'],
                    ['viento', 'Viento'],
                    ['radiacionSolar', 'Radiación Solar'],
                    ['etapaCultivo', 'Etapa Cultivo'],
                  ].map(([name, label]) => (
                    <CInputGroup className="mb-3" key={name}>
                      <CInputGroupText>{label}</CInputGroupText>
                      <CFormInput
                        type="text"
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                  ))}

                  {/* Necesita Riego */}
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

                  {/* Botones */}
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
