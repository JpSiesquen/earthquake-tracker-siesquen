/**
 * Anillos de distancia horizontal (km) centrados en el epicentro.
 * Suficientes para leer la escala del bbox local sin grilla densa.
 */
export const DISTANCE_RING_RADII_KM = [50, 100, 200] as const

/**
 * Marcas de profundidad reales (km) a lo largo del conector.
 * El ultimo valor es siempre la profundidad del foco cuando es > 0.
 */
export function depthTickMarksKm(depthKm: number): number[] {
  if (!Number.isFinite(depthKm) || depthKm <= 0) {
    return []
  }

  const step = depthKm >= 120 ? 50 : depthKm >= 40 ? 25 : 10
  const marks: number[] = []

  for (let depth = step; depth < depthKm - step * 0.35; depth += step) {
    marks.push(depth)
  }

  marks.push(depthKm)
  return marks
}
