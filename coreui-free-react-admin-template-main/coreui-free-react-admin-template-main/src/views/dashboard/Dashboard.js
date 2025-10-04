import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import MetricasModelo from 'src/components/MetricasModelo'
import MapaCalorGeografico from '../../components/MapaCalorGeografico'

const DashboardPredicciones = () => {
  const [tablaCultivos, setTablaCultivos] = useState([])
  const [costoMensual, setCostoMensual] = useState(Array(12).fill(0))
  const [costoTradicional, setCostoTradicional] = useState(Array(12).fill(0))
  const [ahorroMensual, setAhorroMensual] = useState(Array(12).fill(0))
  const [misLecturasGeolocalizadas, setMisLecturasGeolocalizadas] = useState([])
  const [topExplicaciones, setTopExplicaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroCultivo, setFiltroCultivo] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString())

  // --- Modal de detalle ---
  const [modalVisible, setModalVisible] = useState(false)
  const [pagina, setPagina] = useState(1)
  const registrosPorPagina = 10

  const COSTO_POR_M3 = 1.24
  const CONSUMO_TEORICO_M3 = 18000
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const ahorroAnual = ahorroMensual.reduce((acc, val) => acc + val, 0)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5001/api/predicciones/regar-todos')
        if (!res.ok) throw new Error('Error al cargar datos')
        const datos = await res.json()
        setTablaCultivos(datos)

        const explicaciones = {}
        datos.forEach((item) => {
          const exp = item.explicacion?.toLowerCase() || 'sin datos'
          explicaciones[exp] = (explicaciones[exp] || 0) + 1
        })

        const top3 = Object.entries(explicaciones)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
        setTopExplicaciones(top3)
      } catch (err) {
        setError('❌ Error al cargar datos de predicciones')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  useEffect(() => {
    const cargarLecturasGeolocalizadas = async () => {
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
      }
    }

    cargarLecturasGeolocalizadas()
  }, [filtroAnio, filtroMes, filtroCultivo])

  useEffect(() => {
    const acumulador = Array(12).fill(0)
    const tradicional = Array(12).fill(0)
    const ahorro = Array(12).fill(0)

    tablaCultivos.forEach((d) => {
      const fecha = new Date(d.fecha)
      const mes = fecha.getMonth()
      const anio = fecha.getFullYear()

      const coincideCultivo = filtroCultivo === 'Todos' || d.cultivo === filtroCultivo
      const coincideMes = filtroMes === 'Todos' || mes === Number(filtroMes)
      const coincideAnio = filtroAnio === 'Todos' || anio === Number(filtroAnio)

      if (coincideCultivo && coincideMes && coincideAnio) {
        if (d.necesitaRiego) acumulador[mes] += d.costo_estimado
        tradicional[mes] += CONSUMO_TEORICO_M3 * COSTO_POR_M3
      }
    })

    for (let i = 0; i < 12; i++) {
      ahorro[i] = tradicional[i] - acumulador[i]
    }

    setCostoMensual(acumulador)
    setCostoTradicional(tradicional)
    setAhorroMensual(ahorro)
  }, [tablaCultivos, filtroCultivo, filtroMes, filtroAnio])

  const cultivosUnicos = [...new Set(tablaCultivos.map((t) => t.cultivo))]
  const aniosUnicos = [...new Set(tablaCultivos.map((t) => new Date(t.fecha).getFullYear()))].sort()

  // --- Cultivos que requieren riego ---
  const cultivosParaRiego = tablaCultivos.filter(d => d.necesitaRiego)
  const top5 = [...cultivosParaRiego]
    .sort((a, b) => (b.litros_estimados || 0) - (a.litros_estimados || 0))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="text-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      {error && <CAlert color="danger">{error}</CAlert>}

      {/* --- KPIs principales --- */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CCard color="success" textColor="white">
            <CCardBody>
              <h5>💰 Ahorro Anual Simulado</h5>
              <h3>S/. {ahorroAnual.toFixed(2)}</h3>
              <div className="small">Predicción vs riego tradicional</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard color="info" textColor="white">
            <CCardBody>
              <h5>🌱 Cultivos que requieren riego hoy</h5>
              <h3>{cultivosParaRiego.length}</h3>
              <div className="small">Según el modelo de predicción</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard color="primary" textColor="white">
            <CCardBody>
              <h5>💧 Volumen estimado de riego</h5>
              <h3>
                {cultivosParaRiego.reduce((sum, c) => sum + (c.litros_estimados || 0), 0).toFixed(0)} m³
              </h3>
              <div className="small">Total recomendado</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* --- Filtros --- */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CFormSelect
            label="Cultivo"
            value={filtroCultivo}
            onChange={(e) => setFiltroCultivo(e.target.value)}
          >
            <option value="Todos">Todos los cultivos</option>
            {cultivosUnicos.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormSelect
            label="Mes"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="Todos">Todos los meses</option>
            {meses.map((mes, i) => (
              <option key={i} value={i}>{mes}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormSelect
            label="Año"
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {aniosUnicos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      {/* --- Gráfico de costos --- */}
      <CCard className="mb-4">
        <CCardBody>
          <h4 className="mb-3">Comparativa mensual: Tradicional vs Modelo (S/.)</h4>
          <CChartLine
            style={{ height: '300px' }}
            data={{
              labels: meses,
              datasets: [
                {
                  label: 'Costo Tradicional',
                  borderColor: '#6c757d',
                  backgroundColor: 'rgba(108,117,125,0.2)',
                  data: costoTradicional.map((v) => v.toFixed(2)),
                  fill: true,
                },
                {
                  label: 'Costo Estimado (Modelo)',
                  borderColor: '#007bff',
                  backgroundColor: 'rgba(0,123,255,0.2)',
                  data: costoMensual.map((v) => v.toFixed(2)),
                  fill: true,
                },
                {
                  label: 'Ahorro Simulado',
                  borderColor: '#28a745',
                  backgroundColor: 'rgba(40,167,69,0.2)',
                  data: ahorroMensual.map((v) => v.toFixed(2)),
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.dataset.label}: S/. ${Number(context.raw).toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </CCardBody>
      </CCard>

      {/* --- Mapa de riego --- */}
      <CCard className="mb-4">
        <CCardBody>
          <h4 className="mb-3">Mapa de riego recomendado</h4>
          <MapaCalorGeografico datos={misLecturasGeolocalizadas} />
          <div className="small text-muted mt-2">
            Colores: <CBadge color="primary">Recomendado</CBadge>{' '}
            <CBadge color="success">Óptimo</CBadge>{' '}
            <CBadge color="danger">Riego urgente</CBadge>
          </div>
        </CCardBody>
      </CCard>

      {/* --- Top 5 de cultivos con mayor volumen de riego --- */}
      <CCard className="mb-4">
        <CCardBody>
          <h5>🌾 Top 5 cultivos que requieren riego (por volumen)</h5>
          {top5.length === 0 ? (
            <p className="text-muted">No hay riego recomendado actualmente</p>
          ) : (
            <ul>
              {top5.map((c, i) => (
                <li key={i}>
                  <strong>{c.cultivo}</strong> – {new Date(c.fecha).toLocaleDateString()} –{' '}
                  <CBadge color="primary">{c.litros_estimados || 0} m³</CBadge>
                </li>
              ))}
            </ul>
          )}
          {cultivosParaRiego.length > 5 && (
            <CButton color="link" onClick={() => setModalVisible(true)}>
              Ver todos ({cultivosParaRiego.length})
            </CButton>
          )}
        </CCardBody>
      </CCard>

      {/* --- Modal con tabla paginada de todos los cultivos --- */}
      <CModal size="lg" visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader onClose={() => setModalVisible(false)}>
          <CModalTitle>Detalle completo de cultivos que requieren riego</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Cultivo</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Litros (m³)</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {cultivosParaRiego
                .slice((pagina - 1) * registrosPorPagina, pagina * registrosPorPagina)
                .map((c, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell>{c.cultivo}</CTableDataCell>
                    <CTableDataCell>{new Date(c.fecha).toLocaleDateString()}</CTableDataCell>
                    <CTableDataCell>{c.litros_estimados || 0}</CTableDataCell>
                  </CTableRow>
                ))}
            </CTableBody>
          </CTable>
          <div className="d-flex justify-content-between mt-3">
            <CButton
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </CButton>
            <span>Página {pagina}</span>
            <CButton
              disabled={pagina * registrosPorPagina >= cultivosParaRiego.length}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente
            </CButton>
          </div>
        </CModalBody>
      </CModal>

      {/* --- Principales causas de riego --- */}
      <CCard className="mb-4">
        <CCardBody>
          <h5>⚠️ Principales causas de riego</h5>
          <ul>
            {topExplicaciones.map(([motivo, cantidad], index) => (
              <li key={index}>
                {motivo.charAt(0).toUpperCase() + motivo.slice(1)}:{' '}
                <strong>{cantidad}</strong> ocurrencias
              </li>
            ))}
          </ul>
        </CCardBody>
      </CCard>

      {/* --- Métricas del modelo --- */}
      <CCard className="mb-4">
        <CCardBody>
          <MetricasModelo />
        </CCardBody>
      </CCard>
    </>
  )
}

export default DashboardPredicciones
