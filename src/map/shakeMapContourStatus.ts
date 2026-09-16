import type { ShakeMapProductInfo } from '../../shared/detail.ts'
import type { ShakeMapContoursResponse } from '../../shared/shakemap.ts'

export type ShakeMapContourUiKind =
  'absent' | 'absent_no_contours' | 'loading' | 'error' | 'ready'

export type ShakeMapContourUiState = {
  kind: ShakeMapContourUiKind
  /** Mensaje tipado (error) o nota de listo diferido */
  message?: string
  deferred?: boolean
  featureCount?: number
}

type ContourQuerySlice = {
  isPending: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null
  data: ShakeMapContoursResponse | undefined
}

/**
 * Lenguaje de degradación ShakeMap (#100).
 * El chip de disponibilidad no implica contornos en el mapa.
 */
export function deriveShakeMapContourUiState(
  shakemap: ShakeMapProductInfo | undefined,
  query: ContourQuerySlice | null,
): ShakeMapContourUiState | null {
  if (shakemap === undefined) return null

  if (!shakemap.available) {
    return { kind: 'absent' }
  }

  if (shakemap.contourMiUrl === null) {
    return { kind: 'absent_no_contours' }
  }

  if (query === null) {
    return { kind: 'loading' }
  }

  if (query.isError) {
    return {
      kind: 'error',
      message: query.error?.message ?? 'Fallo al obtener contornos MMI',
    }
  }

  if (query.data) {
    return {
      kind: 'ready',
      deferred: query.data.deferred,
      featureCount: query.data.features.length,
    }
  }

  if (query.isPending || query.isFetching) {
    return { kind: 'loading' }
  }

  return { kind: 'loading' }
}

/**
 * Geometría MMI usable en el mapa (#235).
 * `ready` diferido o sin features no cuenta como capa pintable.
 */
export function isShakeMapContourGeometryUsable(
  state: ShakeMapContourUiState | null,
): boolean {
  if (state === null || state.kind !== 'ready') return false
  if (state.deferred) return false
  return (state.featureCount ?? 0) > 0
}

/**
 * Copy corta para el toggle de LayerControl cuando no hay geometría usable.
 */
export function shakeMapContourToggleHint(
  state: ShakeMapContourUiState | null,
  hasSelectedEvent: boolean,
): string {
  if (!hasSelectedEvent) return 'Selecciona un evento'
  if (state === null) return 'Cargando detalle…'

  switch (state.kind) {
    case 'absent':
      return 'Sin ShakeMap en este evento'
    case 'absent_no_contours':
      return 'Sin geometría MMI'
    case 'loading':
      return 'Cargando contornos…'
    case 'error':
      return 'Contornos no disponibles'
    case 'ready':
      if (state.deferred) return 'Geometría aún no lista'
      if ((state.featureCount ?? 0) === 0) return 'Sin geometría MMI'
      return 'ShakeMap del evento'
  }
}
