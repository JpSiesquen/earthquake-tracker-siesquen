import type { FeatureCollection, Point } from 'geojson'

import type { EarthquakeSummary } from '../../shared/earthquake.ts'

export type EarthquakeFeatureProperties = Pick<
  EarthquakeSummary,
  'id' | 'magnitude' | 'place' | 'depthKm' | 'timeMs'
>

export type EarthquakeFeatureCollection = FeatureCollection<
  Point,
  EarthquakeFeatureProperties
>

/** Convierte el DTO del BFF al formato que consume el source GeoJSON de MapLibre. */
export function summariesToGeoJSON(
  earthquakes: readonly EarthquakeSummary[],
): EarthquakeFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: earthquakes.map((earthquake) => ({
      type: 'Feature',
      id: earthquake.id,
      geometry: {
        type: 'Point',
        coordinates: [...earthquake.coordinates],
      },
      properties: {
        id: earthquake.id,
        magnitude: earthquake.magnitude,
        place: earthquake.place,
        depthKm: earthquake.depthKm,
        timeMs: earthquake.timeMs,
      },
    })),
  }
}
