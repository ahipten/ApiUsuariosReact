import React, { useEffect, useState, useMemo } from 'react'
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCol,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { motion } from 'framer-motion'
import MetricasModelo from 'src/components/MetricasModelo'
import MapaCalorGeografico from '../../components/MapaCalorGeografico'

const DashboardPredicciones = () => {
  const [tablaCultivos, setTablaCultivos] = useState([])
  const [costoMensual, setCostoMensual] = useState(Array(12).fill(0))
  const [costoTradicional, setCostoTradicional] = useState(Array(12).fill(0))
  const [ahorroMensual, setAhorroMensual] = useState(Array(12).fill(0))
  const [misLecturasGeolocalizadas, setMisLecturasGeolocalizadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroCultivo, setFiltroCultivo] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString())
  const [tiempoCarga, setTiempoCarga] = useState(0) // ⏱️ Tiempo total de carga

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const ahorroAnual = ahorroMensual.reduce((acc, val) => acc + val, 0)

  // 🔹 Cargar datos principales (predicciones)
  useEffect(() => {
    const cargarDatos = async () => {
      const start = performance.now()
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5001/api/predicciones/regar-todos')
        if (!res.ok) throw new Error('Error al cargar datos')
        const datos = await res.json()
        setTablaCultivos(datos)
      } catch (err) {
        setError('❌ Error al cargar datos de predicciones')
        console.error(err)
      } finally {
        const end = performance.now()
        console.log(`⏱️ Tiempo de carga de predicciones: ${(end - start).toFixed(2)} ms`)
        setTiempoCarga((end - start).toFixed(2))
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  // 🔹 Cargar lecturas geolocalizadas desde el backend con filtros
  useEffect(() => {
    const cargarLecturasGeolocalizadas = async () => {
      const start = performance.now()
      try {
        const params = new URLSearchParams()
        if (filtroAnio !== 'Todos') params.append('anio', filtroAnio)
        if (filtroMes !== 'Todos') params.append('mes', filtroMes)
        if (filtroCultivo !== 'Todos') params.append('cultivo', filtroCultivo)

        const res = await fetch(`http://localhost:5001/api/Lecturas/geo-lecturas?${params.toString()}`)
        if (!res.ok) throw new Error('Error al cargar lecturas geolocalizadas')

        const data = await res.json()
        setMisLecturasGeolocalizadas(data)
      } catch (err) {
        setError('❌ Error al cargar lecturas geolocalizadas')
        console.error(err)
      } finally {
        const end = performance.now()
        const tiempo = (end - start).toFixed(2)
        console.log(`⏱️ Tiempo de carga de lecturas: ${tiempo} ms`)
        setTiempoCarga(tiempo)
      }
    }
    cargarLecturasGeolocalizadas()
  }, [filtroAnio, filtroMes, filtroCultivo])

  // 🔹 Calcular costos y ahorro mensual
  useEffect(() => {
    if (!misLecturasGeolocalizadas.length) return

    const acumulador = Array(12).fill(0)
    const tradicional = Array(12).fill(0)
    const ahorro = Array(12).fill(0)

    misLecturasGeolocalizadas.forEach((l) => {
      const fecha = new Date(l.fecha)
      const mes = fecha.getMonth()

      acumulador[mes] += l.costoEstimado || 0
      tradicional[mes] += l.costoTradicional || 0
      ahorro[mes] += l.ahorroSimulado || 0
    })

    setCostoMensual(acumulador)
    setCostoTradicional(tradicional)
    setAhorroMensual(ahorro)
  }, [misLecturasGeolocalizadas])

  // 🔹 Derivados
  const cultivosUnicos = [...new Set(tablaCultivos.map((t) => t.cultivo))]
  const aniosUnicos = [...new Set(tablaCultivos.map((t) => new Date(t.fecha).getFullYear()))].sort()
  const cultivosParaRiego = tablaCultivos.filter((d) => d.necesitaRiego)

  // 🔹 Memo para el mapa (evita re-render innecesarios)
  const datosMemo = useMemo(() => {
    if (!Array.isArray(misLecturasGeolocalizadas)) return []
    return misLecturasGeolocalizadas.map((d) => ({
      lat: d.lat,
      lng: d.lng,
      intensidad: d.intensidad ?? d.humedad ?? 0,
    }))
  }, [misLecturasGeolocalizadas])

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <CSpinner color="primary" />
        <p className="mt-3 text-gray-600">Cargando datos de predicciones...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
      {error && <CAlert color="danger">{error}</CAlert>}

      {/* --- KPIs principales --- */}
      <CRow className="g-4">
        <CCol md={3}>
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 shadow-md hover:shadow-lg transition-all">
            <h5 className="text-lg font-semibold mb-2">💰 Ahorro Anual Simulado</h5>
            <h2 className="text-4xl font-bold">S/. {ahorroAnual.toFixed(2)}</h2>
            <p className="text-sm opacity-90">Predicción vs riego tradicional</p>
          </div>
        </CCol>
        <CCol md={3}>
          <div className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white p-5 shadow-md hover:shadow-lg transition-all">
            <h5 className="text-lg font-semibold mb-2">🌱 Cultivos que requieren riego hoy</h5>
            <h2 className="text-4xl font-bold">{cultivosParaRiego.length}</h2>
            <p className="text-sm opacity-90">Según el modelo de predicción</p>
          </div>
        </CCol>
        <CCol md={3}>
          <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white p-5 shadow-md hover:shadow-lg transition-all">
            <h5 className="text-lg font-semibold mb-2">💧 Volumen estimado de riego</h5>
            <h2 className="text-4xl font-bold">
              {cultivosParaRiego
                .reduce((sum, c) => sum + (c.litros_estimados || 0), 0)
                .toFixed(0)}{' '}
              m³
            </h2>
            <p className="text-sm opacity-90">Total recomendado</p>
          </div>
        </CCol>
        <CCol md={3}>
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5 shadow-md hover:shadow-lg transition-all">
            <h5 className="text-lg font-semibold mb-2">⏱️ Tiempo de carga</h5>
            <h2 className="text-4xl font-bold">{tiempoCarga} ms</h2>
            <p className="text-sm opacity-90">Medido en frontend</p>
          </div>
        </CCol>
      </CRow>

      {/* --- Métricas del modelo --- */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">
            📊 Rendimiento del Modelo de Riego
          </h4>
          <MetricasModelo />
        </CCardBody>
      </CCard>

      {/* --- Filtros --- */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">Filtros</h4>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormSelect label="Cultivo" value={filtroCultivo} onChange={(e) => setFiltroCultivo(e.target.value)}>
                <option value="Todos">Todos los cultivos</option>
                {cultivosUnicos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect label="Mes" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                <option value="Todos">Todos los meses</option>
                {meses.map((mes, i) => (
                  <option key={i} value={i}>{mes}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect label="Año" value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
                <option value="Todos">Todos</option>
                {aniosUnicos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* --- Gráfico --- */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            Comparativa mensual: Tradicional vs Modelo (S/.)
          </h4>

          {misLecturasGeolocalizadas.length === 0 ? (
            <div className="flex justify-center items-center h-[300px]">
              <CSpinner color="info" />
            </div>
          ) : (
            <CChartLine
              style={{ height: '320px' }}
              data={{
                labels: meses,
                datasets: [
                  {
                    label: 'Costo Tradicional',
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(156,163,175,0.2)',
                    data: costoTradicional.map((v) => v.toFixed(2)),
                    fill: true,
                  },
                  {
                    label: 'Costo Estimado (Modelo)',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    data: costoMensual.map((v) => v.toFixed(2)),
                    fill: true,
                  },
                  {
                    label: 'Ahorro Simulado',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.2)',
                    data: ahorroMensual.map((v) => v.toFixed(2)),
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { labels: { color: '#ccc' } },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `${context.dataset.label}: S/. ${Number(context.raw).toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  x: { ticks: { color: '#ccc' } },
                  y: { ticks: { color: '#ccc' } },
                },
              }}
            />
          )}
        </CCardBody>
      </CCard>

      {/* --- Mapa --- */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">🗺️ Mapa de Riego Recomendado</h4>
          <MapaCalorGeografico lecturas={datosMemo} />
          <div className="small text-muted mt-3">
            Colores:&nbsp;
            <CBadge color="primary">Recomendado</CBadge>{' '}
            <CBadge color="success">Óptimo</CBadge>{' '}
            <CBadge color="danger">Riego urgente</CBadge>
          </div>
        </CCardBody>
      </CCard>
    </motion.div>
  )
}

export default DashboardPredicciones
