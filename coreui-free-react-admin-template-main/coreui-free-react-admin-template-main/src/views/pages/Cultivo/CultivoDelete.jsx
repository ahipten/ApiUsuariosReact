import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
  CAlert,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'

const CultivoDelete = () => {
  const [cultivo, setCultivo] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const fetchCultivo = async () => {
      try {
        const { data } = await api.get(`/cultivos/${id}`)
        setCultivo(data)
      } catch (err) {
        setError('No se pudo cargar el cultivo.')
      }
    }

    fetchCultivo()
  }, [id])

  const handleDelete = async () => {
    try {
      await api.delete(`/cultivos/${id}`)
      setSuccess(true)
      setTimeout(() => navigate('/cultivos'), 1500)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o sin permisos para eliminar.')
        logout()
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError('Error al eliminar el cultivo.')
      }
    }
  }

  const handleCancel = () => navigate(-1)

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCardGroup>
            <CCard className="p-4">
              <CCardBody>
                <h1>Eliminar Cultivo</h1>
                <p className="text-medium-emphasis">¿Estás seguro de eliminar el siguiente cultivo?</p>

                {error && (
                  <CAlert color="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </CAlert>
                )}

                {success && (
                  <CAlert color="success">
                    Cultivo eliminado correctamente.
                  </CAlert>
                )}

                {cultivo && !success && (
                  <>
                    <p><strong>ID:</strong> {cultivo.id}</p>
                    <p><strong>Nombre:</strong> {cultivo.nombre}</p>

                    <CRow className="mt-4">
                      <CCol xs={6}>
                        <CButton color="danger" onClick={handleDelete}>
                          Confirmar eliminación
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
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default CultivoDelete
