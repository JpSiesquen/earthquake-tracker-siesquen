/**
 * Utilidades Terrarium (Tilezen/joerd) para relieve local opcional.
 * Host documentado: AWS elevation-tiles-prod (sin key). No es compromiso de SLA.
 *
 * Decodificacion:
 * https://github.com/tilezen/joerd/blob/master/docs/formats.md
 */

export const TERRARIUM_TILE_URL =
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium'

export const DEM_ATTRIBUTION = 'Terrarium / Mapzen (AWS elevation-tiles-prod)'

/** Medio radio terrestre (km), alineado a localCoordinates. */
const EARTH_MEAN_RADIUS_KM = 6_371.0088
const DEG = Math.PI / 180

export type DemGrid = {
  /** Vertices en km locales: +X este, -Z norte, Y elevacion (km, >= 0 en tierra). */
  positions: Float32Array
  /** RGB 0..1 por vertice (tierra vs agua). */
  colors: Float32Array
  indices: Uint32Array
  resolution: number
  extentKm: number
  /** Epicentro sobre agua (elevacion Terrarium <= 0). */
  originIsWater: boolean
  /** Fraccion de vertices clasificados como agua. */
  waterFraction: number
}

export const DEM_LAND_COLOR = { r: 0.773, g: 0.816, b: 0.847 } as const
export const DEM_WATER_COLOR = { r: 0.42, g: 0.58, b: 0.68 } as const

export function terrariumRgbToMeters(r: number, g: number, b: number): number {
  return r * 256 + g + b / 256 - 32768
}

export function lonLatToTile(
  longitude: number,
  latitude: number,
  zoom: number,
): { x: number; y: number; z: number } {
  const n = 2 ** zoom
  const x = Math.floor(((longitude + 180) / 360) * n)
  const latRad = latitude * DEG
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  )
  return {
    x: Math.min(n - 1, Math.max(0, x)),
    y: Math.min(n - 1, Math.max(0, y)),
    z: zoom,
  }
}

/** Fraccion 0..1 dentro del tile (origen NW del tile). */
export function lonLatToTileUv(
  longitude: number,
  latitude: number,
  zoom: number,
  tileX: number,
  tileY: number,
): { u: number; v: number } {
  const n = 2 ** zoom
  const x = ((longitude + 180) / 360) * n
  const latRad = latitude * DEG
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  return {
    u: x - tileX,
    v: y - tileY,
  }
}

export function localKmToLonLat(
  xKm: number,
  zKm: number,
  originLon: number,
  originLat: number,
): { longitude: number; latitude: number } {
  const latRad = originLat * DEG
  const dLat = -zKm / EARTH_MEAN_RADIUS_KM / DEG
  const cosLat = Math.cos(latRad)
  const dLon = cosLat === 0 ? 0 : xKm / (EARTH_MEAN_RADIUS_KM * cosLat) / DEG
  return {
    longitude: originLon + dLon,
    latitude: originLat + dLat,
  }
}

export function buildDemGridIndices(resolution: number): Uint32Array {
  const cellCount = resolution - 1
  const indices = new Uint32Array(cellCount * cellCount * 6)
  let cursor = 0
  for (let row = 0; row < cellCount; row += 1) {
    for (let col = 0; col < cellCount; col += 1) {
      const a = row * resolution + col
      const b = a + 1
      const c = a + resolution
      const d = c + 1
      indices[cursor++] = a
      indices[cursor++] = c
      indices[cursor++] = b
      indices[cursor++] = b
      indices[cursor++] = c
      indices[cursor++] = d
    }
  }
  return indices
}
