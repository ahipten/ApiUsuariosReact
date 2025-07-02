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
  CFormInput,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import api from "../../../api/axios"               // usa '../../../api/axios' si no tienes alias '@'

/* ─────────── Utilidad para generar contraseñas seguras ─────────── */
const generatePassword = (length = 10) => {
  const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower   = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()-_=+[]{}'
  const all = upper + lower + numbers + symbols

  // Garantizar al menos 1 de cada tipo
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  // Completar el resto
  for (let i = pwd.length; i < length; i++) {
    pwd.push(all[Math.floor(Math.random() * all.length)])
  }

  // Mezclar
  return pwd.sort(() => 0.5 - Math.random()).join('')
}

const UsersEdit = () => {
  /* ─────────── Estados ─────────── */
  const [users, setUsers]   = useState([])
  const [editId, setEditId] = useState(null)
  const [error, setError]   = useState(null)
  const [success, setSuccess] = useState(null)

  const navigate = useNavigate()

  /* ─────────── Cargar usuarios ─────────── */
  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Error al cargar usuarios.'))
  }, [])

  /* ─────────── Cambios en edición inline ─────────── */
  const handleChange = (e, id) => {
    const { name, value } = e.target
    setUsers(users.map(u => (u.id === id ? { ...u, [name]: value } : u)))
  }

  /* ─────────── Guardar cambios ─────────── */
  const handleSave = async (id) => {
    setError(null); setSuccess(null)
    try {
      const user = users.find(u => u.id === id)
      await api.put(`/users/${id}`, user)
      setSuccess('Usuario actualizado correctamente.')
      setEditId(null)
    } catch {
      setError('Error al actualizar usuario.')
    }
  }

  /* ─────────── Resetear contraseña ─────────── */
  const handleResetPassword = async (id) => {
    const newPassword = generatePassword(12)
    if (!window.confirm(`Se generará una nueva contraseña para el usuario.\n\n${newPassword}\n\n¿Continuar?`)) return
    setError(null); setSuccess(null)

    try {
      await api.put(`/users/${id}`, { password: newPassword })
      setSuccess(`Contraseña restablecida. Nueva contraseña: ${newPassword}`)
    } catch {
      setError('Error al resetear la contraseña.')
    }
  }

  /* ─────────── Render ─────────── */
  return (
    <>
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </CAlert>
      )}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}

      <CButton
        color="secondary"
        variant="outline"
        className="mb-3 float-end"
        onClick={() => navigate(-1)}
      >
        ← Cancelar / Volver
      </CButton>

      <CCard>
        <CCardHeader>Editar Usuarios & Reset Password</CCardHeader>
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

                  {/* Username editable */}
                  <CTableDataCell>
                    {editId === user.id ? (
                      <CFormInput
                        name="username"
                        value={user.username}
                        onChange={(e) => handleChange(e, user.id)}
                      />
                    ) : (
                      user.username
                    )}
                  </CTableDataCell>

                  {/* Rol editable */}
                  <CTableDataCell>
                    {editId === user.id ? (
                      <CFormSelect
                        name="role"
                        value={user.role}
                        onChange={(e) => handleChange(e, user.id)}
                        options={[
                          { label: 'User',  value: 'User'  },
                          { label: 'Admin', value: 'Admin' },
                        ]}
                      />
                    ) : (
                      user.role
                    )}
                  </CTableDataCell>

                  {/* Botones */}
                  <CTableDataCell className="d-flex gap-2">
                    {editId === user.id ? (
                      <CButton size="sm" color="success" onClick={() => handleSave(user.id)}>
                        Guardar
                      </CButton>
                    ) : (
                      <CButton size="sm" color="warning" onClick={() => setEditId(user.id)}>
                        Editar
                      </CButton>
                    )}

                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset Password
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

export default UsersEdit
