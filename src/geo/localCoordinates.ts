const EARTH_MEAN_RADIUS_KM = 6_371.0088
const DEGREES_TO_RADIANS = Math.PI / 180

/** Prioriza la lectura de profundidad sin distorsionar en exceso la escena. */
export const DEFAULT_VERTICAL_EXAGGERATION = 1.5

export type GeographicPoint = Readonly<{
  latitude: number
  longitude: number
}>

export type LocalXZ = Readonly<{
  x: number
  z: number
}>

/**
 * Convierte profundidad positiva bajo la superficie a Y negativo, en las
 * mismas unidades kilometro de XZ. Una profundidad desconocida se excluye en
 * vez de representarse falsamente sobre la superficie.
 */
export function depthKmToY(
  depthKm: number | null,
  exaggeration = DEFAULT_VERTICAL_EXAGGERATION,
): number | null {
  if (depthKm === null) {
    return null
  }

  if (!Number.isFinite(depthKm)) {
    throw new RangeError('depthKm must be finite or null')
  }

  if (!Number.isFinite(exaggeration) || exaggeration <= 0) {
    throw new RangeError('exaggeration must be a finite positive number')
  }

  return -depthKm * exaggeration
}

function shortestLongitudeDelta(degrees: number): number {
  return ((degrees + 540) % 360) - 180
}

/**
 * Proyecta un punto geografico respecto de un origen local mediante una
 * aproximacion equirectangular. El resultado esta en kilometros: +X apunta al
 * este y -Z al norte, manteniendo Y como eje vertical en la escena 3D.
 *
 * Es adecuada para vecinos sismicos a escala local. No debe usarse como una
 * proyeccion global ni para medir trayectos extensos o cercanos a los polos.
 */
export function projectLatLonToLocalXZ(
  point: GeographicPoint,
  origin: GeographicPoint,
): LocalXZ {
  const latitudeDelta = (point.latitude - origin.latitude) * DEGREES_TO_RADIANS
  const longitudeDelta =
    shortestLongitudeDelta(point.longitude - origin.longitude) *
    DEGREES_TO_RADIANS
  const referenceLatitude =
    ((point.latitude + origin.latitude) / 2) * DEGREES_TO_RADIANS

  return {
    x: EARTH_MEAN_RADIUS_KM * longitudeDelta * Math.cos(referenceLatitude),
    z: -EARTH_MEAN_RADIUS_KM * latitudeDelta,
  }
}
