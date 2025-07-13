import React from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet.heat'
import { useEffect } from 'react'

const HeatLayer = ({ points }) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const heatLayer = window.L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'orange',
        0.8: 'red',
      },
    }).addTo(map)

    return () => {
      heatLayer.remove()
    }
  }, [map, points])

  return null
}

const MapaCalorGeografico = ({ datos }) => {
  // Asegúrate que cada dato tenga coordenadas: lat, lng, y peso
  const puntos = datos
    .filter((d) => d.lat && d.lng)
    .map((d) => [d.lat, d.lng, d.intensidad || 0.5]) // intensidad opcional

  return (
    <MapContainer center={[-9.474167, -78.310556]} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <HeatLayer points={puntos} />
    </MapContainer>
  )
}

export default MapaCalorGeografico
