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
