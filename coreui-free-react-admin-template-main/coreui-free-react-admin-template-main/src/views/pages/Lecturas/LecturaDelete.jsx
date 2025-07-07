import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CAlert,
  CButton,
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
        const { data } = await api.get(`/lecturas/${id}`)
        setLectura(data)
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

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard className="p-4">
            <CCardBody>
              <h1>Eliminar Lectura</h1>

              {success && (
                <CAlert color="success" dismissible>
                  Lectura eliminada correctamente.
                </CAlert>
              )}

              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </CAlert>
              )}

              {lectura && (
                <>
                  <p>
                    ¿Estás seguro que deseas eliminar la lectura del{' '}
                    <strong>{new Date(lectura.fecha).toLocaleString()}</strong>?
                  </p>

                  <ul>
                    <li><strong>Sensor ID:</strong> {lectura.sensorId}</li>
                    <li><strong>Cultivo ID:</strong> {lectura.cultivoId}</li>
                    <li><strong>Humedad Suelo:</strong> {lectura.humedadSuelo}</li>
                    <li><strong>Temperatura:</strong> {lectura.temperatura}</li>
                  </ul>

                  <CRow className="mt-4">
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

export default LecturaDelete
