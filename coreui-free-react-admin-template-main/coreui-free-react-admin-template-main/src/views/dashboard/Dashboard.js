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

const DashboardPredicciones = () => {
  const [tablaCultivos, setTablaCultivos] = useState([])
  const [costoMensual, setCostoMensual] = useState(Array(12).fill(0))
  const [filtroCultivo, setFiltroCultivo] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  // ✅ 1. Cargar datos solo 1 vez
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const ids = [1, 2, 3, 4]
        const datos = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`http://localhost:5001/api/predicciones/regar-avanzado/${id}`)
            if (!res.ok) throw new Error(`Error al cargar ID ${id}`)
            return await res.json()
          })
        )
        setTablaCultivos(datos)
      } catch (error) {
        console.error('❌ Error al cargar datos:', error)
      }
    }

    cargarDatos()
  }, [])

  // ✅ 2. Actualizar gráfico según filtros aplicados
  useEffect(() => {
    const acumulador = Array(12).fill(0)
    tablaCultivos.forEach((d) => {
      const mes = new Date(d.fecha).getMonth()
      const coincideCultivo = filtroCultivo === 'Todos' || d.cultivo === filtroCultivo
      const coincideMes = filtroMes === 'Todos' || mes === Number(filtroMes)
      if (coincideCultivo && coincideMes) {
        acumulador[mes] += d.costo_estimado
      }
    })
    setCostoMensual(acumulador)
  }, [tablaCultivos, filtroCultivo, filtroMes])

  // ✅ 3. Filtrar tabla
  const tablaFiltrada = tablaCultivos.filter((item) => {
    const mes = new Date(item.fecha).getMonth()
    const coincideCultivo = filtroCultivo === 'Todos' || item.cultivo === filtroCultivo
    const coincideMes = filtroMes === 'Todos' || mes === Number(filtroMes)
    return coincideCultivo && coincideMes
  })

  const cultivosUnicos = [...new Set(tablaCultivos.map((t) => t.cultivo))]

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
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Mes:{' '}
              <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                <option value="Todos">Todos los meses</option>
                {meses.map((mes, i) => (
                  <option key={i} value={i}>
                    {mes}
                  </option>
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

      <CRow>
        <CCol xs>
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
                        <div className="small text-body-secondary">Necesita Riego</div>
                        <div className="fw-semibold">{item.necesitaRiego ? 'Sí' : 'No'}</div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default DashboardPredicciones
