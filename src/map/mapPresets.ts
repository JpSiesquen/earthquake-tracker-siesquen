export type MapCameraPreset = {
  id: 'global' | 'latam' | 'ring-of-fire'
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

/**
 * Cinturon de fuego (vista 2D centrada en el Pacifico).
 * Evita fitBounds que crucen el antimeridiano de forma ambigua.
 */
export const RING_OF_FIRE_PRESET: MapCameraPreset = {
  id: 'ring-of-fire',
  label: 'Anillo de Fuego',
  center: [-160, 5],
  zoom: 1.6,
}

export const MAP_PRESETS: readonly MapCameraPreset[] = [
  GLOBAL_PRESET,
  LATAM_PRESET,
  RING_OF_FIRE_PRESET,
]
