import { NEIGHBOR_LIMIT } from '../api/constants.ts'

/**
 * Presupuesto de render en escena. Alineado al `limit` del BFF (#73) para no
 * dibujar mas mallas de las que ya acota la busqueda FDSN.
 */
export const SCENE_NEIGHBOR_RENDER_CAP = NEIGHBOR_LIMIT

/** Radio minimo (km). Mag baja o ausente no desaparece del volumen. */
export const NEIGHBOR_RADIUS_MIN_KM = 3

/**
 * Radio maximo (km). Queda por debajo del hipocentro foco (10 km) para que el
 * evento seleccionado siga leyendose como ancla visual.
 */
export const NEIGHBOR_RADIUS_MAX_KM = 9

const MAGNITUDE_FOR_MIN_RADIUS = 2
const MAGNITUDE_FOR_MAX_RADIUS = 7

/**
 * Escala lineal acotada: M2 → 3 km, M7+ → 9 km. Magnitud null usa el minimo.
 */
export function magnitudeToNeighborRadiusKm(magnitude: number | null): number {
  if (magnitude === null || !Number.isFinite(magnitude)) {
    return NEIGHBOR_RADIUS_MIN_KM
  }

  if (magnitude <= MAGNITUDE_FOR_MIN_RADIUS) {
    return NEIGHBOR_RADIUS_MIN_KM
  }

  if (magnitude >= MAGNITUDE_FOR_MAX_RADIUS) {
    return NEIGHBOR_RADIUS_MAX_KM
  }

  const t =
    (magnitude - MAGNITUDE_FOR_MIN_RADIUS) /
    (MAGNITUDE_FOR_MAX_RADIUS - MAGNITUDE_FOR_MIN_RADIUS)

  return (
    NEIGHBOR_RADIUS_MIN_KM +
    t * (NEIGHBOR_RADIUS_MAX_KM - NEIGHBOR_RADIUS_MIN_KM)
  )
}
