import type { EarthquakeSummary } from './earthquake.js'

/**
 * Contrato BFF de busqueda FDSN (`GET /api/earthquakes/search`).
 * Shape de evento = mismo `EarthquakeSummary` que el catalogo (#71 endurece Zod).
 */
export type EarthquakeSearchResponse = {
  fetchedAt: number
  stale: boolean
  count: number
  earthquakes: EarthquakeSummary[]
  /** Eco de la query aplicada (debug / UI) */
  query: {
    minlatitude: number
    maxlatitude: number
    minlongitude: number
    maxlongitude: number
    starttime: string
    endtime: string
    minmagnitude: number
    limit: number
  }
}
