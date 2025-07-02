import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CButton,
  CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import api from "../../../api/axios"  // Cambia a '../../../api/axios' si no usas alias '@'

const UsersDelete = () => {
  /* ───────────────────────── Estados ───────────────────────── */
  const [users, setUsers] = useState([])
  const [error, setError]   = useState(null)
  const [success, setSuccess] = useState(null)

  const navigate = useNavigate()

  /* ──────────────────────── Cargar usuarios ─────────────────── */
  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Error al cargar usuarios.'))
  }, [])

  /* ───────────────────────── Eliminar ───────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario definitivamente?')) return
    setError(null); setSuccess(null)
    try {
      await api.delete(`/users/${id}`)
      setUsers(users.filter(u => u.id !== id))
      setSuccess('Usuario eliminado correctamente.')
    } catch {
      setError('Error al eliminar usuario.')
    }
  }

  /* ────────────────────────── Render ────────────────────────── */
  return (
    <>
      {/* Alertas */}
      {success && <CAlert color="success" dismissible onClose={() => setSuccess(null)}>{success}</CAlert>}
      {error   && <CAlert color="danger"  dismissible onClose={() => setError(null)}>{error}</CAlert>}

      {/* Botón Cancelar */}
      <CButton
        color="secondary"
        variant="outline"
        className="mb-3 float-end"
        onClick={() => navigate(-1)}
      >
        ← Cancelar / Volver
      </CButton>

      {/* Tabla */}
      <CCard>
        <CCardHeader>Eliminar Usuarios</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Usuario</CTableHeaderCell>
                <CTableHeaderCell>Rol</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map(user => (
                <CTableRow key={user.id}>
                  <CTableDataCell>{user.id}</CTableDataCell>
                  <CTableDataCell>{user.username}</CTableDataCell>
                  <CTableDataCell>{user.role}</CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="danger" onClick={() => handleDelete(user.id)}>
                      Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default UsersDelete
