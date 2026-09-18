import type { EarthquakeSummary } from '../shared/earthquake.js'

const EARTH_RADIUS_KM = 6_371.0088
const DEDUP_MAX_DISTANCE_KM = 90
const DEDUP_MAX_TIME_MS = 120_000
const DEDUP_MAX_MAG_DELTA = 0.9

function haversineKm(
  lonA: number,
  latA: number,
  lonB: number,
  latB: number,
): number {
  const toRad = Math.PI / 180
  const dLat = (latB - latA) * toRad
  const dLon = (lonB - lonA) * toRad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA * toRad) * Math.cos(latB * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

function isDuplicateOfUsgs(
  candidate: EarthquakeSummary,
  usgs: readonly EarthquakeSummary[],
): boolean {
  for (const event of usgs) {
    const timeDelta = Math.abs(candidate.timeMs - event.timeMs)
    if (timeDelta > DEDUP_MAX_TIME_MS) continue

    const [lonA, latA] = candidate.coordinates
    const [lonB, latB] = event.coordinates
    if (haversineKm(lonA, latA, lonB, latB) > DEDUP_MAX_DISTANCE_KM) continue

    if (
      candidate.magnitude !== null &&
      event.magnitude !== null &&
      Math.abs(candidate.magnitude - event.magnitude) > DEDUP_MAX_MAG_DELTA
    ) {
      continue
    }

    return true
  }
  return false
}

/**
 * USGS primero; EMSC solo aporta eventos que USGS aun no tiene.
 * Orden final: tiempo descendente.
 */
export function mergeUsgsAndEmscCatalogs(
  usgs: readonly EarthquakeSummary[],
  emsc: readonly EarthquakeSummary[],
): EarthquakeSummary[] {
  const extras: EarthquakeSummary[] = []
  for (const candidate of emsc) {
    if (isDuplicateOfUsgs(candidate, usgs)) continue
    extras.push(candidate)
  }

  return [...usgs, ...extras].sort((a, b) => b.timeMs - a.timeMs)
}
