import type { EarthquakeSummary } from '../shared/earthquake.js'
import type { EarthquakeProductFlags } from '../shared/detail.js'
import type { UsgsDetailFeature, UsgsFeature } from '../shared/usgs.js'

/** Feature USGS (summary o detail) → DTO interno del BFF. */
export function toEarthquakeSummary(
  feature: UsgsFeature | UsgsDetailFeature,
): EarthquakeSummary {
  const [longitude, latitude, depthKm] = feature.geometry.coordinates
  return {
    id: feature.id,
    magnitude: feature.properties.mag,
    place: feature.properties.place,
    timeMs: feature.properties.time,
    depthKm,
    coordinates: [longitude, latitude],
  }
}

/**
 * Flags de products desde el detail.
 * Claves USGS: `shakemap`, `losspager` (→ pager), `dyfi`.
 * Solo existencia de entradas; no descarga de contenidos.
 */
export function toProductFlags(
  feature: UsgsDetailFeature,
): EarthquakeProductFlags {
  const products = feature.properties.products
  const has = (key: string): boolean => {
    const entries = products?.[key]
    return Array.isArray(entries) && entries.length > 0
  }

  return {
    shakemap: has('shakemap'),
    pager: has('losspager'),
    dyfi: has('dyfi'),
  }
}
