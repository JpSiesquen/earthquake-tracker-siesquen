import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'

import './MapView.css'

/** Centro inicial alineado al sandbox Fase 0 (Santiago / LATAM). */
const INITIAL_CENTER: [number, number] = [-70.6693, -33.4489]
const INITIAL_ZOOM = 3

/**
 * Style minimo (sin basemap). El basemap free es #44.
 * MapLibre exige un style v8 valido para crear el mapa.
 */
const EMPTY_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [],
}

/**
 * Contenedor MapLibre con ciclo de vida seguro bajo React Strict Mode:
 * create en effect, `map.remove()` en cleanup.
 */
export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = new maplibregl.Map({
      container,
      style: EMPTY_STYLE,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="map-view"
      role="region"
      aria-label="Mapa sismico"
    />
  )
}
