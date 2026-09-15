export type MapCameraPreset = {
  id: 'global' | 'latam'
  label: string
  /** Usar centro+zoom, o bounds (fitBounds). */
  center?: [number, number]
  zoom?: number
  bounds?: [[number, number], [number, number]]
  fitMaxZoom?: number
}

/** Vista inicial del producto (alineada al sandbox Fase 0). */
export const GLOBAL_PRESET: MapCameraPreset = {
  id: 'global',
  label: 'Global',
  center: [-70.6693, -33.4489],
  zoom: 3,
}

/** Encuadre util de LATAM / margen pacifico sudamericano. */
export const LATAM_PRESET: MapCameraPreset = {
  id: 'latam',
  label: 'LATAM',
  bounds: [
    [-120, -58],
    [-30, 35],
  ],
  fitMaxZoom: 4,
}

export const MAP_PRESETS: readonly MapCameraPreset[] = [
  GLOBAL_PRESET,
  LATAM_PRESET,
]
