import React, {
  useEffect,
  useState,
  useMemo,
  useDeferredValue,
} from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CFormSelect,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import { motion } from 'framer-motion'
import { CChartLine } from '@coreui/react-chartjs'
import { Progress } from '@/components/ui/progress'
import MetricasModelo from '@/components/MetricasModelo'
import MapaCalorGeografico from '@/components/MapaCalorGeografico'
import ImportanciaCaracteristicas from '@/components/ImportanciaCaracteristicas'
import RecomendacionRiego from '@/components/RecomendacionRiego'

const DashboardPredicciones = () => {
  // --- Estados ---
  const [lecturas, setLecturas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [progresoCarga, setProgresoCarga] = useState(0)
  const [mensajeProgreso, setMensajeProgreso] = useState('')
  const [tiempoCarga, setTiempoCarga] = useState(0)
  const [error, setError] = useState('')
  const [areaHa, setAreaHa] = useState(1)
  const [metodoRiego, setMetodoRiego] = useState('Goteo') // 'Goteo' | 'Aspersión' | 'Surcos'

  // --- Filtros ---
  const [filtroCultivo, setFiltroCultivo] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')
  const [filtroAnio, setFiltroAnio] = useState('Todos')

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // ============================
  // 🚀 Nueva carga progresiva (streaming NDJSON)
  // ============================
  useEffect(() => {
    const fetchLecturasStream = async () => {
      setCargando(true)
      setError('')
      setProgresoCarga(0)
      setLecturas([])
      setMensajeProgreso('Conectando al servidor...')
      const inicio = performance.now()

      try {
        const resp = await fetch('http://localhost:5001/api/Lecturas/geo-lecturas-stream', {
          headers: { Accept: 'application/x-ndjson' },
        })
        if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`)

        const reader = resp.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let contador = 0
        let lote = [] // <--- buffer temporal
        const loteTam = 2000
        let ultimoFlush = Date.now()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const lectura = JSON.parse(line)
              lote.push(lectura)
              contador++

              // Si el lote está lleno o pasaron 2 segundos => actualiza estado
              const ahora = Date.now()
              if (lote.length >= loteTam || ahora - ultimoFlush > 2000) {
                const copia = [...lote]
                lote = []
                ultimoFlush = ahora
                setLecturas(prev => [...prev, ...copia])
                setProgresoCarga(prev => Math.min(prev + 2, 95))
              }

              if (contador % 2000 === 0) {
                setMensajeProgreso(`Procesadas ${contador.toLocaleString()} lecturas...`)
              }
            } catch (e) {
              console.warn('Línea inválida:', e)
            }
          }
        }

        // Flush final (si quedó algo en buffer)
        if (lote.length > 0) {
          setLecturas(prev => [...prev, ...lote])
        }

        setProgresoCarga(100)
        setMensajeProgreso('✅ Lecturas cargadas correctamente')
        setTiempoCarga(performance.now() - inicio)
      } catch (err) {
        console.error('❌ Error en streaming:', err)
        setError('Error al cargar lecturas desde el servidor.')
        setMensajeProgreso('Error en la conexión o formato NDJSON.')
      } finally {
        setCargando(false)
      }
    }

    fetchLecturasStream()
  }, [])

  // ============================
  // Filtros únicos
  // ============================
  const cultivosUnicos = useMemo(() => {
    return ['Todos', ...new Set(lecturas.map((l) => l.cultivo))].filter(Boolean)
  }, [lecturas])

  const aniosUnicos = useMemo(() => {
    return ['Todos', ...new Set(lecturas.map((l) => new Date(l.fecha).getFullYear()))].filter(Boolean)
  }, [lecturas])

  // ============================
  // Filtro diferido (rendimiento)
  // ============================
  const lecturasFiltradas = useMemo(() => {
    return lecturas.filter((l) => {
      const fecha = new Date(l.fecha)
      const mes = fecha.getMonth()
      const anio = fecha.getFullYear()
      return (
        (filtroCultivo === 'Todos' || l.cultivo === filtroCultivo) &&
        (filtroMes === 'Todos' || mes === Number(filtroMes)) &&
        (filtroAnio === 'Todos' || anio === Number(filtroAnio))
      )
    })
  }, [lecturas, filtroCultivo, filtroMes, filtroAnio])

  const lecturasDeferidas = useDeferredValue(lecturasFiltradas)

  // ============================
  // Agrupación mensual
  // ============================
  const agrupadasPorMes = useMemo(() => {
    const acc = {}
    for (const l of lecturasDeferidas) {
      const f = new Date(l.fecha)
      const key = `${f.getFullYear()}-${f.getMonth()}`
      if (!acc[key]) acc[key] = { t: 0, e: 0, a: 0, mes: f.getMonth(), anio: f.getFullYear() }
      acc[key].t += l.costoTradicional
      acc[key].e += l.costoEstimado
      acc[key].a += l.ahorroSimulado
    }
    return acc
  }, [lecturasDeferidas])

  const clavesOrdenadas = Object.keys(agrupadasPorMes).sort((a, b) => {
    const [aA, aM] = a.split('-').map(Number)
    const [bA, bM] = b.split('-').map(Number)
    return aA === bA ? aM - bM : aA - bA
  })

  const labels = clavesOrdenadas.map((k) => {
    const [anio, mes] = k.split('-').map(Number)
    return `${meses[mes]} ${anio}`
  })

  const costoTradicional = clavesOrdenadas.map((k) => agrupadasPorMes[k].t.toFixed(2))
  const costoEstimado = clavesOrdenadas.map((k) => agrupadasPorMes[k].e.toFixed(2))
  const ahorroMensual = clavesOrdenadas.map((k) => agrupadasPorMes[k].a.toFixed(2))

  const abreviarMonto = (valor) => {
    const num = Number(valor)
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  // Límite de puntos visibles en el mapa
  const lecturasMapa = useMemo(() => lecturasDeferidas.slice(0, 3000), [lecturasDeferidas])

  // ============================
  // Render principal
  // ============================
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
  <CCardBody>
    <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
      💡 Recomendación para el Agricultor
    </h4>

    <RecomendacionRiego
      lecturas={lecturasDeferidas}         // usa las lecturas filtradas actuales
      cultivoSeleccionado={filtroCultivo}  // "Todos" o un cultivo
      areaHa={areaHa}                      // puedes controlar esto con un input
      metodoRiego={metodoRiego}            // idem
      riegoTradicionalM3Ha={50}            // referencia (ajústala según tu realidad)
    />
  </CCardBody>
</CCard>

      {/* Métricas */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">
            📊 Rendimiento del Modelo de Riego
          </h4>
          <MetricasModelo />
        </CCardBody>
      </CCard>

      {/* Filtros */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">Filtros</h4>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormSelect
                label="Cultivo"
                value={filtroCultivo}
                onChange={(e) => setFiltroCultivo(e.target.value)}
              >
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
                {aniosUnicos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Progreso */}
      {progresoCarga > 0 && progresoCarga < 100 && (
        <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
          <CCardBody>
            <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
              ⏳ Cargando lecturas...
            </h4>
            <p>{mensajeProgreso}</p>
            <Progress value={progresoCarga} className="h-3 bg-gray-200 dark:bg-gray-700" />
            <p className="text-xs text-gray-500 text-end">{progresoCarga.toFixed(0)}%</p>
          </CCardBody>
        </CCard>
      )}

      {error && <CAlert color="danger">❌ {error}</CAlert>}

      {progresoCarga === 100 && !error && (
        <CAlert color="success">
          ✅ Descarga completada en {tiempoCarga.toFixed(0)} ms ({lecturas.length} registros)
        </CAlert>
      )}

      {/* Gráfico */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            Comparativa mensual: Tradicional vs Modelo (S/.)
          </h4>
          {cargando ? (
            <div className="flex justify-center items-center h-[300px]">
              <CSpinner color="info" />
            </div>
          ) : (
            <CChartLine
              style={{ height: '320px' }}
              data={{
                labels,
                datasets: [
                  {
                    label: 'Costo Tradicional',
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(156,163,175,0.2)',
                    data: costoTradicional,
                    fill: true,
                  },
                  {
                    label: 'Costo Estimado (Modelo)',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    data: costoEstimado,
                    fill: true,
                  },
                  {
                    label: 'Ahorro Simulado',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.2)',
                    data: ahorroMensual,
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
                      label: (ctx) =>
                        `${ctx.dataset.label}: S/. ${abreviarMonto(ctx.raw)}`,
                    },
                  },
                },
                scales: {
                  x: { ticks: { color: '#ccc' } },
                  y: {
                    ticks: {
                      color: '#ccc',
                      callback: (v) => abreviarMonto(v),
                    },
                  },
                },
              }}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Mapa */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            🗺️ Mapa de Riego Recomendado
          </h4>
          <MapaCalorGeografico lecturas={lecturasMapa} />
          <div className="small text-muted mt-3">
            Colores:&nbsp;
            <CBadge color="primary">Recomendado</CBadge>{' '}
            <CBadge color="success">Óptimo</CBadge>{' '}
            <CBadge color="danger">Riego urgente</CBadge>
          </div>
        </CCardBody>
      </CCard>
      {/* Importancia de características */}
      <CCard className="shadow-sm border-0 bg-gray-900/10 dark:bg-gray-800/40">
        <CCardBody>
          <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            🧠 Importancia de las Características del Modelo
          </h4>
          <ImportanciaCaracteristicas />
        </CCardBody>
      </CCard>
    </motion.div>
  )
}

export default DashboardPredicciones
