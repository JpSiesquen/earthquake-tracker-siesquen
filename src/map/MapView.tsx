import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

import type { EarthquakeSummary } from '../../shared/earthquake.ts'

import 'maplibre-gl/dist/maplibre-gl.css'

import { BASEMAP_STYLE_URL } from './basemap.ts'
import { summariesToGeoJSON } from './earthquakesGeoJSON.ts'
import './MapView.css'

/** Centro inicial alineado al sandbox Fase 0 (Santiago / LATAM). */
const INITIAL_CENTER: [number, number] = [-70.6693, -33.4489]
const INITIAL_ZOOM = 3
const EARTHQUAKES_SOURCE_ID = 'earthquakes'
const EARTHQUAKES_LAYER_ID = 'earthquakes-circles'

/**
 * Contenedor MapLibre con ciclo de vida seguro bajo React Strict Mode:
 * create en effect, `map.remove()` en cleanup.
 */
type MapViewProps = {
  earthquakes: readonly EarthquakeSummary[]
}

export function MapView({ earthquakes }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const earthquakesGeoJSONRef = useRef(summariesToGeoJSON([]))

  useEffect(() => {
    earthquakesGeoJSONRef.current = summariesToGeoJSON(earthquakes)

    const source = mapRef.current?.getSource(EARTHQUAKES_SOURCE_ID)
    if (source instanceof maplibregl.GeoJSONSource) {
      source.setData(earthquakesGeoJSONRef.current)
    }
  }, [earthquakes])

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = new maplibregl.Map({
      container,
      style: BASEMAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })

    mapRef.current = map

    map.on('load', () => {
      map.addSource(EARTHQUAKES_SOURCE_ID, {
        type: 'geojson',
        data: earthquakesGeoJSONRef.current,
      })

      map.addLayer({
        id: EARTHQUAKES_LAYER_ID,
        type: 'circle',
        source: EARTHQUAKES_SOURCE_ID,
        paint: {
          'circle-color': '#d97706',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'magnitude'], 0],
            0,
            3,
            2,
            5,
            4,
            9,
            6,
            14,
            8,
            18,
          ],
          'circle-opacity': 0.72,
          'circle-stroke-color': '#fff7ed',
          'circle-stroke-opacity': 0.9,
          'circle-stroke-width': 1.25,
        },
      })
    })

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
