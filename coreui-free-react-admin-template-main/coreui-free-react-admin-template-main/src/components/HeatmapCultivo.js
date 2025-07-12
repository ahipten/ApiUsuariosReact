import React from 'react'
import { Chart as ChartJS, Tooltip, Legend } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'
import { Chart } from 'react-chartjs-2'


ChartJS.register(MatrixController, MatrixElement, Tooltip, Legend)

const HeatmapCultivo = ({ datos }) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const cultivos = [...new Set(datos.map(d => d.cultivo))]

  // Crear estructura data segura
  const data = []

  datos.forEach(d => {
    const mes = new Date(d.fecha).getMonth()
    const cultivo = d.cultivo
    const key = `${mes}-${cultivo}`
    const existente = data.find(item => item.x === meses[mes] && item.y === cultivo)

    if (existente) {
      existente.v += d.costo_estimado
    } else {
      data.push({
        x: meses[mes],
        y: cultivo,
        v: d.costo_estimado
      })
    }
  })

  return (
    <div className="mb-4">
      <h5 className="mb-3">🔥 Mapa de calor mensual por cultivo</h5>
      <Chart
        type="matrix"
        data={{
          datasets: [
            {
              label: 'Costo estimado',
              data: data,
              backgroundColor: (ctx) => {
                const value = ctx.raw?.v ?? 0
                const alpha = Math.min(1, value / 100)
                return `rgba(255, 99, 132, ${alpha})`
              },
              width: ({ chart }) => (chart.chartArea || {}).width / 12 - 1,
              height: ({ chart }) => (chart.chartArea || {}).height / cultivos.length - 1,
            },
          ],
        }}
        options={{
          scales: {
            x: {
              type: 'category',
              labels: meses,
              title: { display: true, text: 'Mes' },
              grid: { display: false },
            },
            y: {
              type: 'category',
              labels: cultivos,
              title: { display: true, text: 'Cultivo' },
              grid: { display: false },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (ctx) => `${ctx[0].raw.y} - ${ctx[0].raw.x}`,
                label: (ctx) => `Costo: S/. ${ctx.raw.v.toFixed(2)}`,
              },
            },
            legend: { display: false },
          },
        }}
      />
    </div>
  )
}

export default HeatmapCultivo
