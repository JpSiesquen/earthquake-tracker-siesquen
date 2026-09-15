import { useQuery } from '@tanstack/react-query'

import type { CatalogWindow } from '../../shared/window.ts'

import {
  EARTHQUAKES_QUERY_RETRIES,
  EARTHQUAKES_STALE_TIME_MS,
} from './constants.ts'
import { fetchEarthquakes } from './earthquakes.ts'

export function earthquakesQueryKey(window: CatalogWindow) {
  return ['earthquakes', window] as const
}

/**
 * Catalogo USGS via BFF (`/api/earthquakes`).
 */
export function useEarthquakes(window: CatalogWindow = 'day') {
  return useQuery({
    queryKey: earthquakesQueryKey(window),
    queryFn: () => fetchEarthquakes(window),
    staleTime: EARTHQUAKES_STALE_TIME_MS,
    retry: EARTHQUAKES_QUERY_RETRIES,
  })
}
