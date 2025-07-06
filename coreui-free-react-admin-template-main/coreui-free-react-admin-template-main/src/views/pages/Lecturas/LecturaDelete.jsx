import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CButton,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react'

const LecturaDelete = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lectura, setLectura] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchLectura = async () => {
      try {
        const res = await api.get(`/lecturas/${id}`)
        setLectura(res.data)
      } catch (err) {
        setError('No se pudo cargar la lectura.')
      }
    }

    fetchLectura()
  }, [id])

  const handleDelete = async () => {
    try {
      await api.delete(`/lecturas/${id}`)
      setSuccess(true)
      setTimeout(() => navigate('/lecturas'), 1500)
    } catch (err) {
      setError('Error al eliminar la lectura.')
    }
  }

  const handleCancel = () => navigate(-1)

  if (!lectura && !error) return <p>Cargando datos de la lectura...</p>

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardBody>
              <CCardTitle>Eliminar Lectura</CCardTitle>

              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </CAlert>
              )}
              {success && (
                <CAlert color="success" dismissible>
                  Lectura eliminada exitosamente.
                </CAlert>
              )}

              {lectura && (
                <>
                  <CCardText>
                    ¿Estás seguro que deseas eliminar esta lectura registrada el{' '}
                    <strong>{new Date(lectura.fecha).toLocaleString()}</strong>?
                  </CCardText>

                  <ul>
                    <li>Sensor ID: {lectura.sensorId}</li>
                    <li>Cultivo ID: {lectura.cultivoId}</li>
                    <li>Humedad Suelo: {lectura.humedadSuelo}</li>
                    <li>Temperatura: {lectura.temperatura}</li>
                  </ul>

                  <CRow className="mt-4">
                    <CCol xs={6}>
                      <CButton color="danger" onClick={handleDelete}>
                        Eliminar
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-end">
                      <CButton color="secondary" variant="outline" onClick={handleCancel}>
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

export default LecturaDelete
