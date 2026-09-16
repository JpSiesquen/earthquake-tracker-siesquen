import type { EarthquakeSummary } from './earthquake.js'

/**
 * Disponibilidad de products en el detail USGS.
 *
 * Semantica: `true` = el arbol `properties.products` del detail trae al menos
 * una entrada de ese tipo (disponible en USGS). **No** significa que el BFF
 * haya descargado contornos, GeoJSON o PDFs (eso es Fase 6).
 */
export type EarthquakeProductFlags = {
  shakemap: boolean
  /** USGS product type `losspager` */
  pager: boolean
  dyfi: boolean
}

/**
 * Contrato BFF del detalle de un evento.
 */
export type EarthquakeDetailResponse = {
  /** Instantanea Unix (ms) en que el BFF obtuvo (o revalido) el detail */
  fetchedAt: number
  /** true si se sirve dato en memoria tras fallo al refrescar upstream */
  stale: boolean
  earthquake: EarthquakeSummary
  /** Event page USGS si el Feature la trae */
  usgsUrl: string | null
  products: EarthquakeProductFlags
}
