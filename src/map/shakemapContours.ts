import type { ExpressionSpecification } from 'maplibre-gl'

import type { ShakeMapContourFeature } from '../../shared/shakemap.ts'

export const SHAKEMAP_CONTOURS_SOURCE_ID = 'shakemap-contours'
export const SHAKEMAP_CONTOURS_FILL_LAYER_ID = 'shakemap-contours-fill'
export const SHAKEMAP_CONTOURS_LINE_LAYER_ID = 'shakemap-contours-line'

export const EMPTY_SHAKEMAP_FEATURE_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [] as ShakeMapContourFeature[],
}

/**
 * Rampa MMI de laboratorio (#102): fría → ámbar → terracota.
 * No clona el arcoíris USGS ni glow de marketing.
 *
 * | MMI | Color   |
 * | --- | ------- |
 * | 1   | #8a9aab |
 * | 2.5 | #5f8a8a |
 * | 4   | #c4a35a |
 * | 5.5 | #c47a3a |
 * | 7+  | #8b3a4a |
 */
export const MMI_LINE_COLOR: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['coalesce', ['get', 'mmi'], 1],
  1,
  '#8a9aab',
  2.5,
  '#5f8a8a',
  4,
  '#c4a35a',
  5.5,
  '#c47a3a',
  7,
  '#8b3a4a',
]

export const MMI_FILL_COLOR: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['coalesce', ['get', 'mmi'], 1],
  1,
  'rgba(138, 154, 171, 0.14)',
  2.5,
  'rgba(95, 138, 138, 0.16)',
  4,
  'rgba(196, 163, 90, 0.18)',
  5.5,
  'rgba(196, 122, 58, 0.2)',
  7,
  'rgba(139, 58, 74, 0.22)',
]

export const MMI_LEGEND_ITEMS = [
  { label: 'MMI ≤2', color: '#8a9aab' },
  { label: 'MMI ~4', color: '#c4a35a' },
  { label: 'MMI ≥7', color: '#8b3a4a' },
] as const

export function contoursToFeatureCollection(
  features: readonly ShakeMapContourFeature[] | undefined,
): {
  type: 'FeatureCollection'
  features: ShakeMapContourFeature[]
} {
  if (!features || features.length === 0) {
    return EMPTY_SHAKEMAP_FEATURE_COLLECTION
  }
  return {
    type: 'FeatureCollection',
    features: [...features],
  }
}

/**
 * Qué GeoJSON debe quedar en el source al cambiar de evento (#105).
 * Vacío si no hay selección, error, o el dato no corresponde al id actual.
 */
export function resolveShakeMapSourceData(args: {
  selectedId: string | null
  contoursEventId: string | null | undefined
  features: readonly ShakeMapContourFeature[] | undefined
  isError: boolean
}): {
  type: 'FeatureCollection'
  features: ShakeMapContourFeature[]
} {
  const { selectedId, contoursEventId, features, isError } = args
  if (selectedId === null || isError) {
    return EMPTY_SHAKEMAP_FEATURE_COLLECTION
  }
  if (contoursEventId !== selectedId) {
    return EMPTY_SHAKEMAP_FEATURE_COLLECTION
  }
  return contoursToFeatureCollection(features)
}
