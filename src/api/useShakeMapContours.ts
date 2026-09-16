import { useQuery } from '@tanstack/react-query'

import type { EarthquakeId } from '../../shared/earthquake.ts'

import {
  EARTHQUAKES_QUERY_RETRIES,
  SHAKEMAP_CONTOURS_STALE_TIME_MS,
} from './constants.ts'
import { fetchShakeMapContours } from './shakeMapContours.ts'

export function shakeMapContoursQueryKey(id: EarthquakeId) {
  return ['shakemap-contours', id] as const
}

/**
 * Contornos MMI vía BFF. `enabled` solo con URL usable del detail (#99).
 * Fallo local: no tumba detail ni catálogo.
 */
export function useShakeMapContours(
  id: EarthquakeId | null,
  contourMiUrl: string | null | undefined,
) {
  const enabled = id !== null && Boolean(contourMiUrl)

  return useQuery({
    queryKey: shakeMapContoursQueryKey(id ?? 'none'),
    queryFn: () => {
      if (id === null) {
        throw new Error('shakemap contours require an id')
      }
      return fetchShakeMapContours(id)
    },
    enabled,
    staleTime: SHAKEMAP_CONTOURS_STALE_TIME_MS,
    retry: EARTHQUAKES_QUERY_RETRIES,
  })
}
