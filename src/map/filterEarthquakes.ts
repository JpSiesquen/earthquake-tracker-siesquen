import type { EarthquakeSummary } from '../../shared/earthquake.ts'

/**
 * Misma regla de vista que el mapa: excluye magnitud o profundidad desconocida
 * y aplica umbrales de filtro.
 */
export function filterEarthquakes(
  earthquakes: readonly EarthquakeSummary[] | undefined,
  minMagnitude: number,
  maxDepthKm: number,
): EarthquakeSummary[] {
  if (!earthquakes) return []

  return earthquakes.filter(
    (earthquake) =>
      earthquake.magnitude !== null &&
      earthquake.magnitude >= minMagnitude &&
      earthquake.depthKm !== null &&
      earthquake.depthKm <= maxDepthKm,
  )
}
