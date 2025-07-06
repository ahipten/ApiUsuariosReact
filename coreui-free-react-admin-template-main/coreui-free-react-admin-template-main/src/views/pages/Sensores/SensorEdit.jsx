// src/views/sensores/SensorEdit.js
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios'

const SensorEdit = () => {
  const [form, setForm] = useState({ codigo: '', ubicacion: '', usuarioId: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const { data } = await api.get(`/sensores/${id}`)
        setForm({
          codigo: data.codigo,
          ubicacion: data.ubicacion,
          usuarioId: data.usuarioId,
        })
      } catch (err) {
        setError('No se pudo cargar el sensor.')
      }
    }
    fetchSensor()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      await api.put(`/sensores/${id}`, form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el sensor.')
    }
  }

  const handleCancel = () => navigate(-1)

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard className="p-4">
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <h1>Editar Sensor</h1>

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
                  <CFormInput
                    type="number"
                    placeholder="ID del Usuario"
                    name="usuarioId"
                    value={form.usuarioId}
                    onChange={handleChange}
                    required
                  />
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
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default SensorEdit
