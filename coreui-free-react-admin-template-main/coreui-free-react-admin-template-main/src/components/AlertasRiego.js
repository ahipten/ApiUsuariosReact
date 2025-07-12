import React from 'react'
import { CAlert, CAlertHeading, CRow, CCol } from '@coreui/react'

const AlertsRiego = () => {
  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CAlert color="warning">
          <CAlertHeading as="h4">⚠️ Cultivos con alta necesidad de riego</CAlertHeading>
          Revisa los cultivos con <strong>probabilidad alta de riego</strong> y planifica el uso
          de agua para evitar desperdicios. Considera instalar sensores adicionales si el patrón se repite.
        </CAlert>
      </CCol>

      <CCol xs={12}>
        <CAlert color="info">
          <CAlertHeading as="h4">💧 Recomendación de ahorro</CAlertHeading>
          Se ha detectado un posible <strong>ahorro de agua</strong> siguiendo las predicciones del
          modelo. Revisa el gráfico de ahorro mensual y ajusta tu riego según la temporada.
        </CAlert>
      </CCol>

      <CCol xs={12}>
        <CAlert color="danger">
          <CAlertHeading as="h4">🌦️ Alerta de condiciones extremas</CAlertHeading>
          Hay registros de <strong>precipitaciones altas</strong> o <strong>vientos fuertes</strong> que podrían afectar la eficiencia del riego.
          Considera pausar el riego automático en esas zonas.
        </CAlert>
      </CCol>

      <CCol xs={12}>
        <CAlert color="success">
          <CAlertHeading as="h4">✅ Rendimiento del modelo</CAlertHeading>
          El modelo ha mostrado un buen desempeño. Consulta las métricas de precisión y
          especificidad para seguir mejorando la eficiencia del riego.
        </CAlert>
      </CCol>
    </CRow>
  )
}

export default AlertsRiego
