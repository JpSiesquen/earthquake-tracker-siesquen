import type { EarthquakeSummary } from '../shared/earthquake.js'
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
