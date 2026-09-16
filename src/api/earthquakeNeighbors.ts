import type { EarthquakeSummary } from '../../shared/earthquake.ts'
import type { EarthquakeSearchResponse } from '../../shared/search.ts'
import type { BffErrorBody } from '../../shared/errors.ts'

import {
  NEIGHBOR_BBOX_HALF_SPAN_DEG,
  NEIGHBOR_LIMIT,
  NEIGHBOR_MIN_MAGNITUDE,
  NEIGHBOR_TIME_HALF_WINDOW_MS,
} from './constants.ts'

export type NeighborsQuery = {
  minlatitude: number
  maxlatitude: number
  minlongitude: number
  maxlongitude: number
  starttime: string
  endtime: string
  minmagnitude: number
  limit: number
}

/**
 * Reglas documentadas: bbox ±2° y ventana ±3 dias alrededor del evento foco.
 * minmagnitude fija (2.0) para no inundar con micro-sismos.
 */
export function buildNeighborsQuery(focus: EarthquakeSummary): NeighborsQuery {
  const [lon, lat] = focus.coordinates
  const half = NEIGHBOR_BBOX_HALF_SPAN_DEG

  const minlatitude = Math.max(-90, lat - half)
  const maxlatitude = Math.min(90, lat + half)
  let minlongitude = lon - half
  let maxlongitude = lon + half
  // BFF exige min < max y dentro de -180..180; clamp simple (sin wrap antimeridiano).
  minlongitude = Math.max(-180, minlongitude)
  maxlongitude = Math.min(180, maxlongitude)
  if (minlongitude >= maxlongitude) {
    minlongitude = Math.max(-180, lon - 0.5)
    maxlongitude = Math.min(180, lon + 0.5)
  }

  const startMs = focus.timeMs - NEIGHBOR_TIME_HALF_WINDOW_MS
  const endMs = focus.timeMs + NEIGHBOR_TIME_HALF_WINDOW_MS

  return {
    minlatitude,
    maxlatitude,
    minlongitude,
    maxlongitude,
    starttime: new Date(startMs).toISOString(),
    endtime: new Date(endMs).toISOString(),
    minmagnitude: NEIGHBOR_MIN_MAGNITUDE,
    limit: NEIGHBOR_LIMIT,
  }
}

export async function fetchEarthquakeNeighbors(
  focus: EarthquakeSummary,
): Promise<EarthquakeSearchResponse> {
  const q = buildNeighborsQuery(focus)
  const params = new URLSearchParams({
    minlatitude: String(q.minlatitude),
    maxlatitude: String(q.maxlatitude),
    minlongitude: String(q.minlongitude),
    maxlongitude: String(q.maxlongitude),
    starttime: q.starttime,
    endtime: q.endtime,
    minmagnitude: String(q.minmagnitude),
    limit: String(q.limit),
  })

  const res = await fetch(`/api/earthquakes/search?${params}`)
  if (!res.ok) {
    let detail = `earthquake neighbors failed: ${res.status}`
    try {
      const body = (await res.json()) as BffErrorBody
      if (body?.message) detail = body.message
    } catch {
      // ignore
    }
    throw new Error(detail)
  }

  const body = (await res.json()) as EarthquakeSearchResponse
  return {
    ...body,
    earthquakes: body.earthquakes.filter((item) => item.id !== focus.id),
    count: body.earthquakes.filter((item) => item.id !== focus.id).length,
  }
}
