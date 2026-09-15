import type { EarthquakeSummary } from './earthquake.js'
import type { CatalogWindow } from './window.js'

/**
 * Contrato BFF del catalogo. El cliente no ve GeoJSON USGS crudo.
 */
export type CatalogResponse = {
  window: CatalogWindow
  /** Instantanea Unix (ms) en que el BFF obtuvo (o revalido) el feed */
  fetchedAt: number
  /** true si se sirve dato en memoria tras fallo al refrescar upstream */
  stale: boolean
  count: number
  earthquakes: EarthquakeSummary[]
}
