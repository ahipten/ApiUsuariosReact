// src/views/sensores/SensorDelete.js
import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CAlert,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios'

const SensorDelete = () => {
  const [sensor, setSensor] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const { data } = await api.get(`/sensores/${id}`)
        setSensor(data)
      } catch (err) {
        setError('No se pudo cargar el sensor.')
      }
    }
    fetchSensor()
  }, [id])

  const handleDelete = async () => {
    try {
      await api.delete(`/sensores/${id}`)
      setSuccess(true)
      setTimeout(() => navigate('/sensores'), 1500)
    } catch (err) {
      setError('Error al eliminar el sensor.')
    }
  }

  const handleCancel = () => navigate(-1)

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard className="p-4">
            <CCardBody>
              <h1>Eliminar Sensor</h1>

              {success && (
                <CAlert color="success" dismissible>
                  Sensor eliminado correctamente.
                </CAlert>
              )}
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </CAlert>
              )}

              {sensor && (
                <>
                  <p><strong>Código:</strong> {sensor.codigo}</p>
                  <p><strong>Ubicación:</strong> {sensor.ubicacion}</p>
                  <p><strong>Usuario ID:</strong> {sensor.usuarioId}</p>

                  <CRow>
                    <CCol xs={6}>
                      <CButton color="danger" onClick={handleDelete} className="px-4">
                        Confirmar Eliminación
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-end">
                      <CButton color="secondary" variant="outline" onClick={handleCancel} className="px-4">
                        Cancelar
                      </CButton>
                    </CCol>
                  </CRow>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default SensorDelete