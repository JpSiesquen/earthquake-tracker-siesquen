import type { EarthquakeSummary } from './earthquake.js'

/**
 * Products USGS en el DTO de detail (#69 + #99).
 *
 * Semantica:
 * - `available` = el arbol `properties.products` trae al menos una entrada de
 *   ese tipo (existe en USGS).
 * - URL / alerta / felt / cdi = metadatos utiles resueltos en el BFF; `null`
 *   si no hay dato usable. **No** implica que el BFF haya descargado GeoJSON
 *   (contornos = #101+).
 * - El browser no recorre `properties.products` ni llama a USGS.
 */
export type ShakeMapProductInfo = {
  available: boolean
  /** URL de `download/cont_mi.json` (o equivalente) si el product la trae */
  contourMiUrl: string | null
}

export type PagerProductInfo = {
  available: boolean
  /** `alertlevel` del product losspager (green|yellow|orange|red), si viene */
  alert: string | null
}

export type DyfiProductInfo = {
  available: boolean
  /** Respuestas DYFI (`numResp` / `num-responses`) */
  felt: number | null
  /** Intensidad reportada (`maxmmi` del product), si parseable */
  cdi: number | null
}

export type EarthquakeProducts = {
  shakemap: ShakeMapProductInfo
  pager: PagerProductInfo
  dyfi: DyfiProductInfo
}

/**
 * @deprecated Preferir `EarthquakeProducts`. Alias de compatibilidad para
 * lecturas que solo miran disponibilidad (chips).
 */
export type EarthquakeProductFlags = {
  shakemap: boolean
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
  products: EarthquakeProducts
}
