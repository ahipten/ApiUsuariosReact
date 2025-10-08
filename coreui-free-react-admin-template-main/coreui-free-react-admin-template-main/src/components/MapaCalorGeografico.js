// ============================================================
// Componente: MapaGeograficoHibrido.jsx
// Combina Heatmap + Clusterización con selector de vista
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  GoogleMap,
  HeatmapLayer,
  useJsApiLoader
} from '@react-google-maps/api'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

const GOOGLE_MAP_LIBRARIES = ['visualization']

const mapContainerStyle = {
  width: '100%',
  height: '550px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}

const defaultCenter = { lat: -9.462561, lng: -78.316946 }
const CHUNK_SIZE = 4000

const MapaGeograficoHibrido = ({ lecturas = [], zoom = 11 }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  })

  const [modo, setModo] = useState('calor') // 🔘 'calor' o 'cluster'
  const [heatmapData, setHeatmapData] = useState([])
  const [markers, setMarkers] = useState([])
  const clustererRef = useRef(null)
  const mapRef = useRef(null)

  // ============================================================
  // 🔹 Procesamiento de datos de Heatmap (carga progresiva)
  // ============================================================
  useEffect(() => {
    if (!isLoaded || !window.google || lecturas.length === 0) return
    setHeatmapData([])

    let index = 0
    const batch = []

    const procesarLote = () => {
      const slice = lecturas.slice(index, index + CHUNK_SIZE).map((l) => ({
        location: new window.google.maps.LatLng(l.lat, l.lng),
        weight: l.intensidad ?? 1,
      }))
      batch.push(...slice)
      index += CHUNK_SIZE

      if (index < lecturas.length) {
        requestAnimationFrame(procesarLote)
      } else {
        setHeatmapData(batch)
      }
    }

    procesarLote()
  }, [lecturas, isLoaded])

  // ============================================================
  // 🔹 Procesamiento de marcadores para Cluster
  // ============================================================
  useEffect(() => {
    if (!isLoaded || !window.google || !mapRef.current) return
    setMarkers([])

    if (clustererRef.current) clustererRef.current.clearMarkers()

    let i = 0
    const nuevos = []

    const procesarLote = () => {
      const slice = lecturas.slice(i, i + CHUNK_SIZE)
      slice.forEach((p) => {
        nuevos.push(
          new window.google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            title: p.nombre ?? '',
          })
        )
      })
      i += CHUNK_SIZE
      if (i < lecturas.length) {
        requestAnimationFrame(procesarLote)
      } else {
        setMarkers(nuevos)
      }
    }

    procesarLote()
  }, [lecturas, isLoaded])

  // ============================================================
  // 🔹 Inicializa el clusterer cuando los marcadores están listos
  // ============================================================
  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return

    clustererRef.current = new MarkerClusterer({
      map: modo === 'cluster' ? mapRef.current : null,
      markers,
      algorithmOptions: {
        maxZoom: 15,
      },
      renderer: {
        render: ({ count, position }) => {
          const color =
            count < 10
              ? '#7ec8e3'
              : count < 50
              ? '#2196f3'
              : count < 200
              ? '#0d47a1'
              : '#002171'

          const svg = window.btoa(`
            <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
              <circle cx="25" cy="25" r="20" />
              <text x="25" y="30" text-anchor="middle" font-size="16" fill="white">${count}</text>
            </svg>`)

          return new window.google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;base64,${svg}`,
              scaledSize: new window.google.maps.Size(50, 50),
            },
            zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
          })
        },
      },
    })

    return () => clustererRef.current?.clearMarkers()
  }, [markers, modo])

  // ============================================================
  // 🔹 Opciones visuales del Heatmap
  // ============================================================
  const heatmapOptions = useMemo(
    () => ({
      radius: 25,
      opacity: 0.7,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)',
      ],
    }),
    []
  )

  if (!isLoaded) return <p className="text-center text-gray-500">Cargando mapa...</p>

  return (
    <div>
      {/* Selector de modo */}
      <div className="flex justify-center mb-3">
        <label className="flex items-center gap-2 font-medium text-gray-700">
          <input
            type="radio"
            name="modo"
            value="calor"
            checked={modo === 'calor'}
            onChange={() => setModo('calor')}
          />
          🌡️ Vista Calor
        </label>
        <label className="flex items-center gap-2 font-medium text-gray-700 ml-6">
          <input
            type="radio"
            name="modo"
            value="cluster"
            checked={modo === 'cluster'}
            onChange={() => setModo('cluster')}
          />
          🧩 Vista Agrupada
        </label>
      </div>

      {/* Mapa principal */}
      <div style={mapContainerStyle}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={zoom}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {modo === 'calor' && heatmapData.length > 0 && (
            <HeatmapLayer data={heatmapData} options={heatmapOptions} />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}

export default React.memo(MapaGeograficoHibrido)
