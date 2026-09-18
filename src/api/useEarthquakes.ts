import { useQuery } from '@tanstack/react-query'

import type { CatalogWindow } from '../../shared/window.ts'

import {
  EARTHQUAKES_QUERY_RETRIES,
  EARTHQUAKES_STALE_TIME_MS,
} from './constants.ts'
import { fetchEarthquakes } from './earthquakes.ts'

/** Refresco en vivo: USGS/EMSC pueden llegar con minutos de desfase. */
const EARTHQUAKES_REFETCH_INTERVAL_MS = 60_000

export function earthquakesQueryKey(window: CatalogWindow) {
  return ['earthquakes', window] as const
}

/**
 * Catalogo USGS (+ complemento EMSC) via BFF (`/api/earthquakes`).
 */
export function useEarthquakes(window: CatalogWindow = 'week') {
  return useQuery({
    queryKey: earthquakesQueryKey(window),
    queryFn: () => fetchEarthquakes(window),
    staleTime: EARTHQUAKES_STALE_TIME_MS,
    refetchInterval: EARTHQUAKES_REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    retry: EARTHQUAKES_QUERY_RETRIES,
  })
}
