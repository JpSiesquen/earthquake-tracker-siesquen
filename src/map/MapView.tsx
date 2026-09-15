import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import type { EarthquakeSummary } from '../../shared/earthquake.ts'
import type { CatalogWindow } from '../../shared/window.ts'
import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import 'maplibre-gl/dist/maplibre-gl.css'

import { BASEMAP_STYLE_URL } from './basemap.ts'
import { EarthquakeList } from './EarthquakeList.tsx'
import { summariesToGeoJSON } from './earthquakesGeoJSON.ts'
import { filterEarthquakes } from './filterEarthquakes.ts'
import { LayerControl, type MapLayerVisibility } from './LayerControl.tsx'
import {
  DEFAULT_MAX_DEPTH_KM,
  DEFAULT_MIN_MAGNITUDE,
  MapFilters,
} from './MapFilters.tsx'
import './MapView.css'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

/** Centro inicial alineado al sandbox Fase 0 (Santiago / LATAM). */
const INITIAL_CENTER: [number, number] = [-70.6693, -33.4489]
const INITIAL_ZOOM = 3
const EARTHQUAKES_SOURCE_ID = 'earthquakes'
const EARTHQUAKES_LAYER_ID = 'earthquakes-circles'
const EARTHQUAKES_HEATMAP_LAYER_ID = 'earthquakes-heatmap'
const TECTONIC_PLATES_SOURCE_ID = 'tectonic-plates'
const TECTONIC_PLATES_LAYER_ID = 'tectonic-plates-lines'
const TECTONIC_PLATES_DATA_URL =
  '/data/tectonic-plates/PB2002_boundaries.geojson'
const DEFAULT_LAYER_VISIBILITY: MapLayerVisibility = {
  earthquakes: true,
  plates: true,
  heatmap: false,
}
const SHALLOW_MAX_DEPTH_KM = 70
const INTERMEDIATE_MAX_DEPTH_KM = 300
const DEPTH_COLORS = {
  shallow: '#b86b25',
  intermediate: '#287a78',
  deep: '#28527a',
  unknown: '#6b7280',
} as const

const DEPTH_LEGEND_ITEMS = [
  {
    label: `Menos de ${SHALLOW_MAX_DEPTH_KM} km`,
    color: DEPTH_COLORS.shallow,
  },
  {
    label: `${SHALLOW_MAX_DEPTH_KM} a <${INTERMEDIATE_MAX_DEPTH_KM} km`,
    color: DEPTH_COLORS.intermediate,
  },
  {
    label: `${INTERMEDIATE_MAX_DEPTH_KM} km o más`,
    color: DEPTH_COLORS.deep,
  },
  { label: 'Sin dato', color: DEPTH_COLORS.unknown },
] as const

function numericProperty(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function createEarthquakePopupContent(
  properties: Record<string, unknown>,
): HTMLDivElement {
  const magnitude = numericProperty(properties.magnitude)
  const depthKm = numericProperty(properties.depthKm)
  const place =
    typeof properties.place === 'string' && properties.place.trim()
      ? properties.place
      : 'Ubicación sin dato'

  const content = document.createElement('div')
  content.className = 'earthquake-popup'

  const magnitudeElement = document.createElement('strong')
  magnitudeElement.className = 'earthquake-popup__magnitude'
  magnitudeElement.textContent = `M ${magnitude?.toFixed(1) ?? '—'}`

  const placeElement = document.createElement('span')
  placeElement.className = 'earthquake-popup__place'
  placeElement.textContent = place

  const depthElement = document.createElement('span')
  depthElement.className = 'earthquake-popup__depth'
  depthElement.textContent =
    depthKm === null
      ? 'Profundidad sin dato'
      : `${depthKm.toFixed(1)} km de profundidad`

  content.append(magnitudeElement, placeElement, depthElement)
  return content
}

/**
 * Contenedor MapLibre con ciclo de vida seguro bajo React Strict Mode:
 * create en effect, `map.remove()` en cleanup.
 */
type MapViewProps = {
  earthquakes?: readonly EarthquakeSummary[]
  window: CatalogWindow
  isCatalogLoading: boolean
  isCatalogFetching: boolean
  isCatalogStale: boolean
  catalogError: string | null
  onWindowChange: (window: CatalogWindow) => void
}

export function MapView({
  earthquakes,
  window,
  isCatalogLoading,
  isCatalogFetching,
  isCatalogStale,
  catalogError,
  onWindowChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const layerVisibilityRef = useRef(DEFAULT_LAYER_VISIBILITY)
  const earthquakesGeoJSONRef = useRef(summariesToGeoJSON([]))
  const selectedIdRef = useRef<string | null>(null)
  const [layerVisibility, setLayerVisibility] = useState(
    DEFAULT_LAYER_VISIBILITY,
  )
  const [minMagnitude, setMinMagnitude] = useState(DEFAULT_MIN_MAGNITUDE)
  const [maxDepthKm, setMaxDepthKm] = useState(DEFAULT_MAX_DEPTH_KM)
  const selectedId = useEarthquakeSelection((state) => state.selectedId)
  const select = useEarthquakeSelection((state) => state.select)
  const clear = useEarthquakeSelection((state) => state.clear)
  const visibleEarthquakes = useMemo(
    () => filterEarthquakes(earthquakes, minMagnitude, maxDepthKm),
    [earthquakes, maxDepthKm, minMagnitude],
  )

  useEffect(() => {
    layerVisibilityRef.current = layerVisibility

    const map = mapRef.current
    if (!map) return

    const mapLayers: [string, boolean][] = [
      [EARTHQUAKES_LAYER_ID, layerVisibility.earthquakes],
      [TECTONIC_PLATES_LAYER_ID, layerVisibility.plates],
      [EARTHQUAKES_HEATMAP_LAYER_ID, layerVisibility.heatmap],
    ]

    for (const [layerId, visible] of mapLayers) {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none',
        )
      }
    }
  }, [layerVisibility])

  useEffect(() => {
    earthquakesGeoJSONRef.current = summariesToGeoJSON(visibleEarthquakes)

    const source = mapRef.current?.getSource(EARTHQUAKES_SOURCE_ID)
    if (source instanceof maplibregl.GeoJSONSource) {
      source.setData(earthquakesGeoJSONRef.current)
    }
  }, [visibleEarthquakes])

  useEffect(() => {
    if (
      selectedId !== null &&
      !visibleEarthquakes.some((earthquake) => earthquake.id === selectedId)
    ) {
      clear()
    }
  }, [clear, selectedId, visibleEarthquakes])

  useEffect(() => {
    const map = mapRef.current
    const previousId = selectedIdRef.current
    selectedIdRef.current = selectedId

    if (!map?.getSource(EARTHQUAKES_SOURCE_ID)) return

    if (previousId !== null) {
      map.setFeatureState(
        { source: EARTHQUAKES_SOURCE_ID, id: previousId },
        { selected: false },
      )
    }

    if (selectedId !== null) {
      map.setFeatureState(
        { source: EARTHQUAKES_SOURCE_ID, id: selectedId },
        { selected: true },
      )
    }
  }, [selectedId])

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
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
    })

    const clearHover = () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    }

    map.on('load', () => {
      map.addSource(TECTONIC_PLATES_SOURCE_ID, {
        type: 'geojson',
        data: TECTONIC_PLATES_DATA_URL,
      })

      map.addLayer({
        id: TECTONIC_PLATES_LAYER_ID,
        type: 'line',
        source: TECTONIC_PLATES_SOURCE_ID,
        layout: {
          visibility: layerVisibilityRef.current.plates ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#536577',
          'line-opacity': 0.58,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1,
            0.7,
            7,
            1.35,
            11,
            2,
          ],
        },
      })

      map.addSource(EARTHQUAKES_SOURCE_ID, {
        type: 'geojson',
        data: earthquakesGeoJSONRef.current,
      })

      map.addLayer({
        id: EARTHQUAKES_HEATMAP_LAYER_ID,
        type: 'heatmap',
        source: EARTHQUAKES_SOURCE_ID,
        layout: {
          visibility: layerVisibilityRef.current.heatmap ? 'visible' : 'none',
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'magnitude'], 0],
            0,
            0.1,
            2,
            0.4,
            4,
            0.8,
            6,
            1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1,
            1,
            8,
            2,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(40, 122, 120, 0)',
            0.1,
            'rgba(40, 122, 120, 0.58)',
            0.4,
            'rgba(184, 107, 37, 0.72)',
            0.7,
            'rgba(190, 63, 44, 0.82)',
            1,
            'rgba(109, 40, 63, 0.9)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 1, 8, 8, 36],
          'heatmap-opacity': 0.78,
        },
      })

      map.addLayer({
        id: EARTHQUAKES_LAYER_ID,
        type: 'circle',
        source: EARTHQUAKES_SOURCE_ID,
        layout: {
          visibility: layerVisibilityRef.current.earthquakes
            ? 'visible'
            : 'none',
        },
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'depthKm'], null],
            DEPTH_COLORS.unknown,
            [
              'step',
              ['get', 'depthKm'],
              DEPTH_COLORS.shallow,
              SHALLOW_MAX_DEPTH_KM,
              DEPTH_COLORS.intermediate,
              INTERMEDIATE_MAX_DEPTH_KM,
              DEPTH_COLORS.deep,
            ],
          ],
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
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#172033',
            '#fff7ed',
          ],
          'circle-stroke-opacity': 0.9,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            1.25,
          ],
        },
      })

      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          {
            source: EARTHQUAKES_SOURCE_ID,
            id: selectedIdRef.current,
          },
          { selected: true },
        )
      }

      map.on('mouseenter', EARTHQUAKES_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mousemove', EARTHQUAKES_LAYER_ID, (event) => {
        const properties = event.features?.[0]?.properties
        if (!properties) {
          clearHover()
          return
        }

        popup
          .setLngLat(event.lngLat)
          .setDOMContent(createEarthquakePopupContent(properties))
          .addTo(map)
      })

      map.on('click', EARTHQUAKES_LAYER_ID, (event) => {
        const id = event.features?.[0]?.properties.id
        if (typeof id === 'string') {
          select(id)
        }
      })

      map.on('mouseleave', EARTHQUAKES_LAYER_ID, clearHover)
    })

    map.on('movestart', clearHover)
    map.on('zoomstart', clearHover)

    return () => {
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [select])

  const handleLayerVisibilityChange = (
    layer: keyof MapLayerVisibility,
    visible: boolean,
  ) => {
    setLayerVisibility((current) => ({ ...current, [layer]: visible }))
  }

  const resetFilters = () => {
    setMinMagnitude(DEFAULT_MIN_MAGNITUDE)
    setMaxDepthKm(DEFAULT_MAX_DEPTH_KM)
  }

  return (
    <div className="map-frame">
      <div className="map-stage">
        <div
          ref={containerRef}
          className="map-view"
          role="region"
          aria-label="Mapa sismico"
        />
        <LayerControl
          visibility={layerVisibility}
          onVisibilityChange={handleLayerVisibilityChange}
        />
        <aside className="depth-legend" aria-label="Leyenda de profundidad">
          <p className="depth-legend__title">Profundidad</p>
          <ul className="depth-legend__list">
            {DEPTH_LEGEND_ITEMS.map((item) => (
              <li key={item.label}>
                <span
                  className="depth-legend__swatch"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.label}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <MapFilters
        minMagnitude={minMagnitude}
        maxDepthKm={maxDepthKm}
        visibleCount={visibleEarthquakes.length}
        totalCount={earthquakes?.length ?? 0}
        window={window}
        isCatalogLoading={isCatalogLoading}
        isCatalogFetching={isCatalogFetching}
        isCatalogStale={isCatalogStale}
        catalogError={catalogError}
        onMinMagnitudeChange={setMinMagnitude}
        onMaxDepthChange={setMaxDepthKm}
        onWindowChange={onWindowChange}
        onReset={resetFilters}
      />
      <EarthquakeList earthquakes={visibleEarthquakes} />
    </div>
  )
}
