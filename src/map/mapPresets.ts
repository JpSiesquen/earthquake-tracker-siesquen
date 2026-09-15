export type MapCameraPreset = {
  id: 'global'
  label: string
  center: [number, number]
  zoom: number
}

/** Vista inicial del producto (alineada al sandbox Fase 0). */
export const GLOBAL_PRESET: MapCameraPreset = {
  id: 'global',
  label: 'Global',
  center: [-70.6693, -33.4489],
  zoom: 3,
}

export const MAP_PRESETS: readonly MapCameraPreset[] = [GLOBAL_PRESET]
