import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { motion } from 'framer-motion'

// Registrar módulos de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

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

  const renderCard = (label, value, index) => (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <CCard className={`border-${getColor(value)} shadow-sm bg-light`}>
        <CCardHeader className={`text-${getColor(value)} fw-bold`}>
          {label}
        </CCardHeader>
        <CCardBody>
          <h3 className={`text-${getColor(value)}`}>
            {(value * 100).toFixed(2)}%
          </h3>
        </CCardBody>
      </CCard>
    </motion.div>
  )

  if (!metricas) {
    return (
      <div className="text-center p-4">
        <CSpinner color="primary" />
        <p>Cargando métricas del modelo...</p>
      </div>
    )
  }

  // Gráfico de barras
  const barData = {
    labels: [
      'Accuracy',
      'Precision',
      'Recall',
      'Specificity',
      'F1 Score',
      'AUC ROC',
    ],
    datasets: [
      {
        label: 'Rendimiento (%)',
        data: [
          metricas.accuracy * 100,
          metricas.precision * 100,
          metricas.recall * 100,
          metricas.specificity * 100,
          metricas.f1 * 100,
          metricas.auc * 100,
        ],
        backgroundColor: [
          '#4e79a7',
          '#f28e2b',
          '#e15759',
          '#76b7b2',
          '#59a14f',
          '#edc949',
        ],
        borderRadius: 6,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Comparativa visual del rendimiento del modelo' },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
      },
    },
  }

  // Gráfico donut
  const donutData = {
    labels: ['Accuracy', 'Precision', 'F1 Score', 'AUC ROC'],
    datasets: [
      {
        label: 'Rendimiento (%)',
        data: [
          metricas.accuracy * 100,
          metricas.precision * 100,
          metricas.f1 * 100,
          metricas.auc * 100,
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        hoverOffset: 8,
      },
    ],
  }

  const donutOptions = {
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Distribución de métricas clave' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.toFixed(2)}%`,
        },
      },
    },
  }

  return (
    <motion.div
      className="p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <motion.h4
        className="mb-4 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >


      </motion.h4>

      {/* Tarjetas animadas */}
      <CRow className="gy-3 mb-4">
        {[
          ['Accuracy', metricas.accuracy],
          ['Precision', metricas.precision],
          ['Recall (Sensibilidad)', metricas.recall],
          ['Specificity', metricas.specificity],
          ['F1 Score', metricas.f1],
          ['AUC ROC', metricas.auc],
        ].map(([label, value], i) => (
          <CCol xs={12} sm={6} md={4} key={label}>
            {renderCard(label, value, i)}
          </CCol>
        ))}
      </CRow>

      {/* Gráficos animados */}
      <CRow>
        <CCol md={8}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <CCard className="shadow-sm mb-4">
              <CCardHeader className="fw-semibold">📈 Gráfico comparativo</CCardHeader>
              <CCardBody>
                <Bar data={barData} options={barOptions} />
              </CCardBody>
            </CCard>
          </motion.div>
        </CCol>

        <CCol md={4}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <CCard className="shadow-sm mb-4">
              <CCardHeader className="fw-semibold">🍩 Resumen visual</CCardHeader>
              <CCardBody>
                <Doughnut data={donutData} options={donutOptions} />
              </CCardBody>
            </CCard>
          </motion.div>
        </CCol>
      </CRow>
    </motion.div>
  )
}

export default MetricasModelo
