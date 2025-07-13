import React, { useEffect, useState } from 'react'
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownHeader,
  CBadge,
  CDropdownDivider,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'

const AppHeaderNotifications = () => {
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    fetch('http://localhost:5001/api/alertas') // 🔁 Ajusta esto si usas otro puerto/backend
      .then((res) => res.json())
      .then((data) => setNotificaciones(data))
      .catch((error) => console.error('Error al obtener notificaciones:', error))
  }, [])

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CIcon icon={cilBell} size="lg" />
        <CBadge color="danger" position="top-end" shape="rounded-pill">
          {notificaciones.length}
        </CBadge>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">
          Notificaciones
        </CDropdownHeader>

        {notificaciones.length === 0 ? (
          <CDropdownItem disabled>No hay alertas recientes</CDropdownItem>
        ) : (
          notificaciones.map((n, index) => (
            <CDropdownItem key={index} className="d-flex align-items-center">
              <CBadge color="warning" className="me-2">
                ●
              </CBadge>
              <span>{n.Mensaje || n.mensaje}</span>
            </CDropdownItem>
          ))
        )}

        <CDropdownDivider />
        <CDropdownItem href="#">Ver todas</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderNotifications
