/**
 * Bandas de profundidad compartidas entre el mapa 2D y la escena 3D.
 * Encoding elegido para vecinos 3D (#93): profundidad (no tiempo), para
 * reforzar la tesis de Capa 2 y reutilizar la misma lectura que Capa 1.
 */

export const SHALLOW_MAX_DEPTH_KM = 70
export const INTERMEDIATE_MAX_DEPTH_KM = 300

export const DEPTH_COLORS = {
  shallow: '#b86b25',
  intermediate: '#287a78',
  deep: '#28527a',
  unknown: '#6b7280',
} as const

export type DepthBand = keyof typeof DEPTH_COLORS

export const DEPTH_LEGEND_ITEMS = [
  {
    band: 'shallow' as const,
    label: `Menos de ${SHALLOW_MAX_DEPTH_KM} km`,
    color: DEPTH_COLORS.shallow,
  },
  {
    band: 'intermediate' as const,
    label: `${SHALLOW_MAX_DEPTH_KM} a <${INTERMEDIATE_MAX_DEPTH_KM} km`,
    color: DEPTH_COLORS.intermediate,
  },
  {
    band: 'deep' as const,
    label: `${INTERMEDIATE_MAX_DEPTH_KM} km o más`,
    color: DEPTH_COLORS.deep,
  },
  {
    band: 'unknown' as const,
    label: 'Sin dato',
    color: DEPTH_COLORS.unknown,
  },
] as const

/** Leyenda 3D: sin "Sin dato" porque esos vecinos no se renderizan. */
export const SCENE_DEPTH_LEGEND_ITEMS = DEPTH_LEGEND_ITEMS.filter(
  (item) => item.band !== 'unknown',
)

export function depthKmToBand(depthKm: number | null): DepthBand {
  if (depthKm === null || !Number.isFinite(depthKm)) {
    return 'unknown'
  }

  if (depthKm < SHALLOW_MAX_DEPTH_KM) {
    return 'shallow'
  }

  if (depthKm < INTERMEDIATE_MAX_DEPTH_KM) {
    return 'intermediate'
  }

  return 'deep'
}

export function depthKmToColor(depthKm: number | null): string {
  return DEPTH_COLORS[depthKmToBand(depthKm)]
}
