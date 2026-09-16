import { useQuery } from '@tanstack/react-query'

import type { EarthquakeDetailResponse } from '../../shared/detail.ts'

import {
  EARTHQUAKES_QUERY_RETRIES,
  EARTHQUAKE_DETAIL_STALE_TIME_MS,
} from './constants.ts'
import { fetchEarthquakeNeighbors } from './earthquakeNeighbors.ts'

export function earthquakeNeighborsQueryKey(focusId: string) {
  return ['earthquake-neighbors', focusId] as const
}

/**
 * Vecinos FDSN via BFF search, derivados del detail.
 * Solo corre cuando el detail esta settled con data.
 */
export function useEarthquakeNeighbors(
  detail: EarthquakeDetailResponse | undefined,
) {
  const focus = detail?.earthquake

  return useQuery({
    queryKey: earthquakeNeighborsQueryKey(focus?.id ?? 'none'),
    queryFn: () => {
      if (!focus) {
        throw new Error('earthquake neighbors require detail')
      }
      return fetchEarthquakeNeighbors(focus)
    },
    enabled: focus !== undefined,
    staleTime: EARTHQUAKE_DETAIL_STALE_TIME_MS,
    retry: EARTHQUAKES_QUERY_RETRIES,
  })
}
