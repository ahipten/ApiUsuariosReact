// src/components/RecomendacionRiego.jsx
import React, { useMemo } from 'react'

/**
 * RecomendacionRiego
 * ---------------------------------------------------------
 * Props:
 * - lecturas: array de lecturas (las mismas que usas en tu Dashboard)
 *             { fecha, cultivo, HumedadSuelo?, Evapotranspiracion?, Precipitacion?, DeficitHidrico?, ... }
 * - cultivoSeleccionado: string (ej. "Maíz", "Todos")
 * - areaHa: número (área del lote en hectáreas) -> default 1 ha
 * - metodoRiego: "Goteo" | "Aspersión" | "Surcos" -> para estimar eficiencia
 * - riegoTradicionalM3Ha: referencia histórica de riego por evento (m³/ha) -> default 50
 *
 * Nota:
 * - Si DeficitHidrico (mm) está presente en lecturas, se usa para la lámina recomendada.
 * - Si no, se estima con humedad/ET0 de forma conservadora.
 *
 * Conversión útil:
 *   1 mm sobre 1 ha = 10 m³
 */


const semaforo = {
  HOY: { color: 'bg-red-500', text: 'Regar hoy' },
  PRONTO: { color: 'bg-yellow-500', text: 'Regar en 1–2 días' },
  NO: { color: 'bg-green-600', text: 'No regar ahora' },
}

function formatNumber(n, digits = 1) {
  const v = Number(n ?? 0)
  return v.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

export default function RecomendacionRiego({
  lecturas = [],
  areaHa = 1,
  metodoRiego = 'Goteo',
  riegoTradicionalM3Ha = 50,
}) {
  // Transformar tu formato { Feature, DeltaAUC } a un objeto clave-valor
  const valores = useMemo(() => {
    const mapa = {}
    lecturas.forEach((item) => {
      mapa[item.Feature] = item.DeltaAUC
    })
    return mapa
  }, [lecturas])

  const humedad = valores['HumedadSuelo']
  const balance = valores['Balance_Agua']
  const lluvia = valores['Precipitacion']
  const radiacion = valores['RadiacionSolar']
  const temp = valores['Temperatura']

  // --- Interpretación simple de estado (semáforo)
  let estado = 'NO'

  if (humedad !== undefined && balance !== undefined) {
    if (balance < -0.25 || humedad < -0.08) estado = 'HOY'
    else if (balance < -0.10 || humedad < -0.04) estado = 'PRONTO'
  }

  const eficiencia = eficienciaPorMetodo[metodoRiego] ?? 0.85
  const laminaMm = Math.abs(balance * 100) // Escalado base
  const laminaEfectivaMm = laminaMm / eficiencia
  const volumenM3 = laminaEfectivaMm * areaHa * 10

  const tradicionalTotal = riegoTradicionalM3Ha * areaHa
  const ahorroM3 = Math.max(0, tradicionalTotal - volumenM3)
  const ahorroPct = (ahorroM3 / tradicionalTotal) * 100

  const sem = semaforo[estado]

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 text-slate-100 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🌾 Recomendación de Riego</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${sem.color}`}>
          {sem.text}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Bloque 1 */}
        <div className="rounded-xl bg-slate-900/40 p-4">
          <p className="text-sm text-slate-300 mb-1">Condiciones del cultivo</p>
          <div className="space-y-1 text-sm">
            <p>🌡️ Temperatura: {formatNumber(temp)} (ΔAUC)</p>
            <p>💧 Humedad Suelo: {formatNumber(humedad)}</p>
            <p>☀️ Radiación Solar: {formatNumber(radiacion)}</p>
            <p>🌧️ Precipitación: {formatNumber(lluvia)}</p>
            <p>⚖️ Balance de Agua: {formatNumber(balance)}</p>
          </div>
        </div>

        {/* Bloque 2 */}
        <div className="rounded-xl bg-slate-900/40 p-4">
          <p className="text-sm text-slate-300 mb-1">Volumen recomendado</p>
          <p className="text-3xl font-extrabold">
            {formatNumber(volumenM3, 0)} <span className="text-base font-semibold">m³</span>
          </p>
          <p className="text-slate-300 mt-2">
            Lámina: <span className="font-semibold">{formatNumber(laminaEfectivaMm, 1)} mm</span>  
            ({formatNumber(laminaMm, 1)} mm bruta · eficiencia {formatNumber(eficiencia * 100, 0)}%)
          </p>

          <div className="mt-4">
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-2 ${sem.color}`}
                style={{ width: `${Math.min(100, (laminaEfectivaMm / 40) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bloque 3 */}
        <div className="rounded-xl bg-slate-900/40 p-4">
          <p className="text-sm text-slate-300 mb-1">Ahorro estimado</p>
          <p className="text-3xl font-extrabold text-emerald-400">
            {formatNumber(ahorroM3, 0)} <span className="text-base font-semibold text-slate-200">m³</span>
          </p>
          <p className="text-slate-300">
            ({formatNumber(ahorroPct, 0)}% menos que el tradicional)
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Consejo: prioriza riegos tempranos (mañana/tarde) para reducir evaporación. Si se esperan lluvias,
        reduce el volumen en esa proporción.
      </p>
    </div>
  )
}