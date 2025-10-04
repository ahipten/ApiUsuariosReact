import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CRow, CCol, CSpinner } from '@coreui/react'

const MetricasModelo = () => {
  const [metricas, setMetricas] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5001/api/metricas/evaluar')
      .then((res) => res.json())
      .then((data) => setMetricas(data))
      .catch((err) => console.error('❌ Error al cargar métricas:', err))
  }, [])

  const getColor = (valor) => {
    if (valor >= 0.9) return 'success'
    if (valor >= 0.75) return 'warning'
    return 'danger'
  }

  const renderCard = (label, value) => (
    <CCol xs={12} sm={6} md={4} key={label}>
      <CCard className={`border-${getColor(value)}`}>
        <CCardHeader className={`text-${getColor(value)} fw-bold`}>
          {label}
        </CCardHeader>
        <CCardBody>
          <h3 className={`text-${getColor(value)}`}>
            {(value * 100).toFixed(2)}%
          </h3>
        </CCardBody>
      </CCard>
    </CCol>
  )

  if (!metricas) {
    return (
      <div className="text-center p-4">
        <CSpinner color="primary" />
        <p>Cargando métricas del modelo...</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="mb-4">📊 Rendimiento del Modelo de Riego escogido: <span className="text-primary">{metricas.modelo}</span></h4>
      <CRow>
        {renderCard('Accuracy', metricas.accuracy)}
        {renderCard('Precision', metricas.precision)}
        {renderCard('Recall (Sensibilidad)', metricas.recall)}
        {renderCard('Specificity', metricas.specificity)}
        {renderCard('F1 Score', metricas.f1)}
        {renderCard('AUC ROC', metricas.auc)}
      </CRow>
    </div>
  )
}

export default MetricasModelo
