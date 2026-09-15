import type { EarthquakeSummary } from '../shared/earthquake.js'
import type { UsgsFeature } from '../shared/usgs.js'

/** Feature USGS → DTO interno del BFF. */
export function toEarthquakeSummary(feature: UsgsFeature): EarthquakeSummary {
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
