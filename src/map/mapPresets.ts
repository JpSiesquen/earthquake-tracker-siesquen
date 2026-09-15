export type MapCameraPreset = {
  id: 'global' | 'latam' | 'ring-of-fire'
  label: string
  center: [number, number]
  zoom: number
}

/**
 * Overview mundial. No usar Santiago: a zoom medio solo muestra el Cono Sur.
 * [lon, lat] GeoJSON.
 */
export const GLOBAL_PRESET: MapCameraPreset = {
  id: 'global',
  label: 'Global',
  center: [0, 12],
  zoom: 1.35,
}

/**
 * America Latina / margen pacifico. Center+zoom evita el fitBounds laxo
 * que empujaba el Atlantico y el borde de Africa en viewports anchos.
 */
export const LATAM_PRESET: MapCameraPreset = {
  id: 'latam',
  label: 'LATAM',
  center: [-72, -15],
  zoom: 2.55,
}

/**
 * Cinturon de fuego (vista 2D centrada en el Pacifico).
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
