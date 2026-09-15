/**
 * Tipos base del dominio sismico (sin Zod todavia; schemas en #32+).
 * Lon/lat en orden GeoJSON: [longitud, latitud].
 */
export type LonLat = readonly [longitude: number, latitude: number]

export type EarthquakeId = string

export type EarthquakeSummary = {
  id: EarthquakeId
  magnitude: number | null
  place: string | null
  /** Epoch UTC en milisegundos */
  timeMs: number
  depthKm: number | null
  coordinates: LonLat
}
