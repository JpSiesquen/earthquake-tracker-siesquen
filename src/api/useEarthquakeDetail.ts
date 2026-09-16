import { useQuery } from '@tanstack/react-query'

import type { EarthquakeId } from '../../shared/earthquake.ts'

import {
  EARTHQUAKES_QUERY_RETRIES,
  EARTHQUAKE_DETAIL_STALE_TIME_MS,
} from './constants.ts'
import { fetchEarthquakeDetail } from './earthquakeDetail.ts'

export function earthquakeDetailQueryKey(id: EarthquakeId) {
  return ['earthquake-detail', id] as const
}

/**
 * Detail USGS via BFF (`/api/earthquakes/:id`).
 * Sin id no dispara request.
 */
export function useEarthquakeDetail(id: EarthquakeId | null) {
  return useQuery({
    queryKey: earthquakeDetailQueryKey(id ?? 'none'),
    queryFn: () => {
      if (id === null) {
        throw new Error('earthquake detail requires an id')
      }
      return fetchEarthquakeDetail(id)
    },
    enabled: id !== null,
    staleTime: EARTHQUAKE_DETAIL_STALE_TIME_MS,
    retry: EARTHQUAKES_QUERY_RETRIES,
  })
}
