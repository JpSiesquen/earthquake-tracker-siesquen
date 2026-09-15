/**
 * Tipos base del dominio sismico.
 * Lon/lat en orden GeoJSON: [longitud, latitud].
 */
export type LonLat = readonly [longitude: number, latitude: number]

export type EarthquakeId = string

/** Evento normalizado que consume el cliente (no es el Feature USGS crudo). */
export type EarthquakeSummary = {
  id: EarthquakeId
  magnitude: number | null
  place: string | null
  /** Epoch UTC en milisegundos */
  timeMs: number
  depthKm: number | null
  coordinates: LonLat
}
