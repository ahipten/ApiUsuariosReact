import React, { useEffect, useState } from 'react'
import {
  CAvatar,
  CCard,
  CCardBody,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilPlant } from '@coreui/icons'
import { cifPe } from '@coreui/icons'
import avatar1 from 'src/assets/images/avatars/1.jpg'
import { CChartBar } from '@coreui/react-chartjs'
import MetricasModelo from 'src/components/MetricasModelo'
import MapaCalorGeografico from '../../components/MapaCalorGeografico'

const DashboardPredicciones = () => {
  const [tablaCultivos, setTablaCultivos] = useState([])
  const [costoMensual, setCostoMensual] = useState(Array(12).fill(0))
  const [costoTradicional, setCostoTradicional] = useState(Array(12).fill(0))
  const [ahorroMensual, setAhorroMensual] = useState(Array(12).fill(0))
  const ahorroAnual = ahorroMensual.reduce((acc, val) => acc + val, 0)
  const [filtroCultivo, setFiltroCultivo] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString())
  const [topExplicaciones, setTopExplicaciones] = useState([])
  const [misLecturasGeolocalizadas, setMisLecturasGeolocalizadas] = useState([])
  const COSTO_POR_M3 = 1.24
  const CONSUMO_TEORICO_M3 = 18000
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  useEffect(() => {
    const cargarDatos = async () => {
      try {
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
      } catch (error) {
        console.error('❌ Error al cargar datos:', error)
      }
    }

    cargarDatos()
  }, [])
  
    useEffect(() => {
      const cargarLecturasGeolocalizadas = async () => {
        try {
          const params = new URLSearchParams()

          if (filtroAnio !== 'Todos') {
            params.append('anio', filtroAnio)
          }

          if (filtroMes !== 'Todos') {
            params.append('mes', filtroMes)
          }

          if (filtroCultivo !== 'Todos') {
            params.append('cultivo', filtroCultivo)
          }

          const res = await fetch(`http://localhost:5001/api/Lecturas/geo-lecturas?${params.toString()}`)
          if (!res.ok) throw new Error('Error al cargar lecturas geolocalizadas')
          const data = await res.json()
          setMisLecturasGeolocalizadas(data)
        } catch (error) {
          console.error('❌ Error al cargar lecturas geolocalizadas:', error)
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
        // Costo estimado real (modelo)
        if (d.necesitaRiego) {
          acumulador[mes] += d.costo_estimado
        }

        // Costo tradicional fijo por mes
        tradicional[mes] += CONSUMO_TEORICO_M3 * COSTO_POR_M3
      }
    })

    for (let i = 0; i < 12; i++) {
      ahorro[i] = acumulador[i] - tradicional[i]  
    }

    setCostoMensual(acumulador)
    setCostoTradicional(tradicional)
    setAhorroMensual(ahorro)
  }, [tablaCultivos, filtroCultivo, filtroMes, filtroAnio])

  const tablaFiltrada = tablaCultivos.filter((item) => {
    const fecha = new Date(item.fecha)
    const mes = fecha.getMonth()
    const anio = fecha.getFullYear()
    const coincideCultivo = filtroCultivo === 'Todos' || item.cultivo === filtroCultivo
    const coincideMes = filtroMes === 'Todos' || mes === Number(filtroMes)
    const coincideAnio = filtroAnio === 'Todos' || anio === Number(filtroAnio)
    return coincideCultivo && coincideMes && coincideAnio
  })

  const cultivosUnicos = [...new Set(tablaCultivos.map((t) => t.cultivo))]
  const aniosUnicos = [...new Set(tablaCultivos.map((t) => new Date(t.fecha).getFullYear()))].sort()

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <h4 className="mb-3">Comparativa mensual: Tradicional vs Modelo (S/.)</h4>

          <div className="d-flex gap-3 mb-4">
            <label>
              Cultivo:{' '}
              <select value={filtroCultivo} onChange={(e) => setFiltroCultivo(e.target.value)}>
                <option value="Todos">Todos los cultivos</option>
                {cultivosUnicos.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Mes:{' '}
              <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                <option value="Todos">Todos los meses</option>
                {meses.map((mes, i) => (
                  <option key={i} value={i}>{mes}</option>
                ))}
              </select>
            </label>

            <label>
              Año:{' '}
              <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
                <option value="Todos">Todos</option>
                {aniosUnicos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>

          <CChartBar
            style={{ height: '300px' }}
            data={{
              labels: meses,
              datasets: [
                {
                  label: 'Costo Tradicional (S/.)',
                  backgroundColor: '#6c757d',
                  data: costoTradicional.map((v) => v.toFixed(2)),
                },
                {
                  label: 'Costo Estimado Real (Modelo)',
                  backgroundColor: '#007bff',
                  data: costoMensual.map((v) => v.toFixed(2)),
                },
                {
                  label: 'Ahorro Simulado',
                  backgroundColor: '#28a745',
                  data: ahorroMensual.map((v) => v.toFixed(2)),
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
         <MapaCalorGeografico datos={misLecturasGeolocalizadas} />
        </CCardBody>
      </CCard>
      <CCard className="mb-4 border-success" style={{ backgroundColor: '#d4edda' }}>
      <CCardBody>
        <h5 className="mb-0 text-success">
          💰 Ahorro Anual Simulado: <strong>S/. {ahorroAnual.toFixed(2)}</strong>
        </h5>
        <div className="text-muted small">Basado en predicciones vs. riego tradicional</div>
      </CCardBody>
    </CCard>
    <CCard className="mb-4">
    <CCardBody>
      <h5 className="mb-3">⚠️ Principales causas de riego</h5>
      <ul>
        {topExplicaciones.map(([motivo, cantidad], index) => (
          <li key={index}>
            {motivo.charAt(0).toUpperCase() + motivo.slice(1)}: <strong>{cantidad}</strong> ocurrencias
          </li>
        ))}
      </ul>
    </CCardBody>
  </CCard>
      <CCard className="mb-4">
        <CCardBody>
          <MetricasModelo />
        </CCardBody>
      </CCard>

      {/* Aquí puedes mantener la tabla y causas de riego si lo deseas */}
    </>
  )
}

export default DashboardPredicciones
