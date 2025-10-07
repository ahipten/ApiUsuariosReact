import React, { useMemo } from 'react'
import { GoogleMap, HeatmapLayer, useJsApiLoader } from '@react-google-maps/api'

const MapaCalorGeografico = ({ data = [] }) => {
  // 🔹 Carga segura del script de Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Usa tu clave
    libraries: ['visualization'],
  })

  // 🔹 Convierte tus coordenadas a objetos LatLng SOLO cuando esté listo
  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google?.maps) return []
    return data.map((p) => new window.google.maps.LatLng(p.lat, p.lng))
  }, [isLoaded, data])

  if (loadError) return <p>❌ Error al cargar el mapa.</p>
  if (!isLoaded) return <p>⏳ Cargando mapa...</p>

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '500px' }}
      center={{ lat: -9.475, lng: -78.3 }}
      zoom={10}
    >
      <HeatmapLayer data={heatmapData} />
    </GoogleMap>
  )
}

export default MapaCalorGeografico
