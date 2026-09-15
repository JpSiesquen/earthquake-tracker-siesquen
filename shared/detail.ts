import type { EarthquakeSummary } from './earthquake.js'

/**
 * Contrato BFF del detalle de un evento.
 * Forma provisional (#67): summary + url USGS. Zod estricto y flags de
 * products llegan en #68/#69.
 */
export type EarthquakeDetailResponse = {
  /** Instantanea Unix (ms) en que el BFF obtuvo (o revalido) el detail */
  fetchedAt: number
  /** true si se sirve dato en memoria tras fallo al refrescar upstream */
  stale: boolean
  earthquake: EarthquakeSummary
  /** Event page USGS si el Feature la trae */
  usgsUrl: string | null
}
