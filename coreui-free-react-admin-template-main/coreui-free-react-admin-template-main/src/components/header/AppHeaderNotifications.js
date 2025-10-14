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
    const fetchAlertas = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/alertas')
        const data = await res.json()
        setNotificaciones(Array.isArray(data) ? data : [data])
      } catch (error) {
        console.error('Error al obtener alertas:', error)
      }
    }

    fetchAlertas()
    const interval = setInterval(fetchAlertas, 60000)
    return () => clearInterval(interval)
  }, [])

  const getBadgeColor = (nivel) => {
    switch (nivel) {
      case 'Alto':
        return 'danger'
      case 'Moderado':
        return 'warning'
      case 'Bajo':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return new Date().toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit' })
    try {
      const parsed = new Date(fecha)
      if (isNaN(parsed)) return '—'
      return parsed.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '—'
    }
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CIcon icon={cilBell} size="lg" />
        {notificaciones.length > 0 && (
          <CBadge color="danger" position="top-end" shape="rounded-pill">
            {notificaciones.length}
          </CBadge>
        )}
      </CDropdownToggle>

      <CDropdownMenu
        className="pt-0"
        placement="bottom-end"
        style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}
      >
        <CDropdownHeader className="bg-light fw-semibold py-2 text-dark">
          Notificaciones de Alerta
        </CDropdownHeader>

        {notificaciones.length === 0 ? (
          <CDropdownItem disabled>No hay alertas recientes</CDropdownItem>
        ) : (
          notificaciones.map((n, index) => (
            <CDropdownItem
              key={index}
              className="d-flex flex-column align-items-start border-bottom pb-2"
            >
              <div className="d-flex align-items-center w-100 mb-1">
                <CBadge color={getBadgeColor(n.nivel || 'info')} className="me-2">
                  ⚠️
                </CBadge>
                <strong>{n.cultivo || 'Cultivo no especificado'}</strong>
              </div>

              <small className="text-muted">
                {n.metodo_riego ? `Método: ${n.metodo_riego}` : 'Sin método'} — {formatFecha()}
              </small>

              <span className="text-wrap text-secondary" style={{ fontSize: '0.85rem' }}>
                {n.mensaje || 'Sin descripción disponible'}
              </span>
            </CDropdownItem>
          ))
        )}

        <CDropdownDivider />
        <CDropdownItem href="#">🔍 Ver todas las alertas</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderNotifications
