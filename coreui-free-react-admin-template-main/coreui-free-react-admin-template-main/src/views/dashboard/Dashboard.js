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
import { CChartLine } from '@coreui/react-chartjs'
import MetricasModelo from 'src/components/MetricasModelo'

const DashboardPredicciones = () => {
  const [tablaCultivos, setTablaCultivos] = useState([])
  const [costoMensual, setCostoMensual] = useState(Array(12).fill(0))
  const [filtroCultivo, setFiltroCultivo] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')
  const [filtroAnio, setFiltroAnio] = useState('2024')
  const [topExplicaciones, setTopExplicaciones] = useState([])

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
    const acumulador = Array(12).fill(0)
    tablaCultivos.forEach((d) => {
      const fecha = new Date(d.fecha)
      const mes = fecha.getMonth()
      const anio = fecha.getFullYear()
      const coincideCultivo = filtroCultivo === 'Todos' || d.cultivo === filtroCultivo
      const coincideMes = filtroMes === 'Todos' || mes === Number(filtroMes)
      const coincideAnio = filtroAnio === 'Todos' || anio === Number(filtroAnio)

      if (coincideCultivo && coincideMes && coincideAnio) {
        acumulador[mes] += d.costo_estimado
      }
    })
    setCostoMensual(acumulador)
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
          <h4 className="mb-3">Costo Estimado de Riego por Mes (S/.)</h4>

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

          <CChartLine
            style={{ height: '300px' }}
            data={{
              labels: meses,
              datasets: [
                {
                  label: 'Costo estimado S/.',
                  backgroundColor: 'rgba(0,123,255,0.1)',
                  borderColor: '#007bff',
                  data: costoMensual.map((v) => v.toFixed(2)),
                  fill: true,
                },
              ],
            }}
          />
        </CCardBody>
      </CCard>

      {/* 📈 Métricas del modelo */}
      <CCard className="mb-4">
        <CCardBody>
          <MetricasModelo />
        </CCardBody>
      </CCard>

      <CRow>
        <CCol md={9}>
          <CCard className="mb-4">
            <CCardBody>
              <h4 className="mb-3">Predicciones de Riego</h4>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Cultivo</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">País</CTableHeaderCell>
                    <CTableHeaderCell>Producción</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Tipo</CTableHeaderCell>
                    <CTableHeaderCell>Actividad</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tablaFiltrada.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" src={avatar1} status={item.necesitaRiego ? 'danger' : 'success'} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.cultivo}</div>
                        <div className="small text-body-secondary">
                          Temporada: <strong>{item.temporada}</strong>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={cifPe} title="Perú" />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">{item.costo_estimado.toFixed(2)} S/.</div>
                          <div className="ms-3">
                            <small className="text-body-secondary">{item.fecha}</small>
                          </div>
                        </div>
                        <CProgress
                          thin
                          color={item.necesitaRiego ? 'danger' : 'success'}
                          value={item.probabilidad * 100}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={cilPlant} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary">Motivo</div>
                        <div className="fw-semibold">{item.explicacion}</div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={3}>
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
        </CCol>
      </CRow>
    </>
  )
}

export default DashboardPredicciones
