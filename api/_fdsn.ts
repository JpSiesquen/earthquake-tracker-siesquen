import { z } from 'zod'

import type { EarthquakeSearchResponse } from '../shared/search.js'
import { usgsFeatureSchema } from '../shared/usgs.js'

import { BffError } from './_errors.js'
import { toEarthquakeSummary } from './_normalize.js'

const FDSN_QUERY_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

const USER_AGENT =
  'earthquake-tracker-siesquen/0.0.0 (+https://earthquake-tracker-siesquen.vercel.app)'

const TIMEOUT_MS = 10_000

/** Limites anti-abuso (BFF). */
export const FDSN_LIMITS = {
  maxBboxSpanDeg: 20,
  maxTimeRangeMs: 30 * 24 * 60 * 60 * 1000,
  defaultLimit: 100,
  maxLimit: 200,
} as const

/** Coleccion FDSN provisional (#70). #71 sustituye por schema dedicado. */
const fdsnFeatureCollectionProvisionalSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(usgsFeatureSchema),
})

export type FdsnSearchParams = {
  minlatitude: number
  maxlatitude: number
  minlongitude: number
  maxlongitude: number
  starttime: string
  endtime: string
  minmagnitude: number
  limit: number
}

function parseNumber(raw: string | null, name: string): number {
  if (raw === null || raw.trim() === '') {
    throw new BffError(400, 'bad_request', `Missing query param: ${name}`)
  }
  const n = Number(raw)
  if (!Number.isFinite(n)) {
    throw new BffError(400, 'bad_request', `Invalid number for ${name}`)
  }
  return n
}

function parseIsoTime(raw: string | null, name: string): string {
  if (raw === null || raw.trim() === '') {
    throw new BffError(400, 'bad_request', `Missing query param: ${name}`)
  }
  const ms = Date.parse(raw)
  if (!Number.isFinite(ms)) {
    throw new BffError(400, 'bad_request', `Invalid ISO time for ${name}`)
  }
  return new Date(ms).toISOString()
}

/**
 * Valida query params de `/api/earthquakes/search`.
 * Requiere bbox + rango temporal + minmagnitude.
 */
export function parseFdsnSearchParams(url: URL): FdsnSearchParams {
  const minlatitude = parseNumber(
    url.searchParams.get('minlatitude'),
    'minlatitude',
  )
  const maxlatitude = parseNumber(
    url.searchParams.get('maxlatitude'),
    'maxlatitude',
  )
  const minlongitude = parseNumber(
    url.searchParams.get('minlongitude'),
    'minlongitude',
  )
  const maxlongitude = parseNumber(
    url.searchParams.get('maxlongitude'),
    'maxlongitude',
  )
  const starttime = parseIsoTime(url.searchParams.get('starttime'), 'starttime')
  const endtime = parseIsoTime(url.searchParams.get('endtime'), 'endtime')
  const minmagnitude = parseNumber(
    url.searchParams.get('minmagnitude'),
    'minmagnitude',
  )

  const limitRaw = url.searchParams.get('limit')
  const limit =
    limitRaw === null || limitRaw.trim() === ''
      ? FDSN_LIMITS.defaultLimit
      : parseNumber(limitRaw, 'limit')

  if (minlatitude < -90 || maxlatitude > 90 || minlatitude >= maxlatitude) {
    throw new BffError(400, 'bad_request', 'Invalid latitude bounds')
  }
  if (
    minlongitude < -180 ||
    maxlongitude > 180 ||
    minlongitude >= maxlongitude
  ) {
    throw new BffError(400, 'bad_request', 'Invalid longitude bounds')
  }
  if (maxlatitude - minlatitude > FDSN_LIMITS.maxBboxSpanDeg) {
    throw new BffError(
      400,
      'bad_request',
      `Latitude span exceeds ${FDSN_LIMITS.maxBboxSpanDeg} deg`,
    )
  }
  if (maxlongitude - minlongitude > FDSN_LIMITS.maxBboxSpanDeg) {
    throw new BffError(
      400,
      'bad_request',
      `Longitude span exceeds ${FDSN_LIMITS.maxBboxSpanDeg} deg`,
    )
  }

  const startMs = Date.parse(starttime)
  const endMs = Date.parse(endtime)
  if (endMs <= startMs) {
    throw new BffError(400, 'bad_request', 'endtime must be after starttime')
  }
  if (endMs - startMs > FDSN_LIMITS.maxTimeRangeMs) {
    throw new BffError(400, 'bad_request', 'Time range exceeds 30 days')
  }

  if (minmagnitude < 0 || minmagnitude > 10) {
    throw new BffError(400, 'bad_request', 'minmagnitude out of range')
  }
  if (limit < 1 || limit > FDSN_LIMITS.maxLimit) {
    throw new BffError(
      400,
      'bad_request',
      `limit must be 1..${FDSN_LIMITS.maxLimit}`,
    )
  }

  return {
    minlatitude,
    maxlatitude,
    minlongitude,
    maxlongitude,
    starttime,
    endtime,
    minmagnitude,
    limit,
  }
}

/**
 * Proxy FDSN event query (solo servidor). Devuelve DTO propio.
 */
export async function fetchFdsnSearch(
  params: FdsnSearchParams,
): Promise<EarthquakeSearchResponse> {
  const url = new URL(FDSN_QUERY_URL)
  url.searchParams.set('format', 'geojson')
  url.searchParams.set('orderby', 'time')
  url.searchParams.set('minlatitude', String(params.minlatitude))
  url.searchParams.set('maxlatitude', String(params.maxlatitude))
  url.searchParams.set('minlongitude', String(params.minlongitude))
  url.searchParams.set('maxlongitude', String(params.maxlongitude))
  url.searchParams.set('starttime', params.starttime)
  url.searchParams.set('endtime', params.endtime)
  url.searchParams.set('minmagnitude', String(params.minmagnitude))
  url.searchParams.set('limit', String(params.limit))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
    })
  } catch (cause) {
    const aborted =
      cause instanceof Error &&
      (cause.name === 'AbortError' || cause.message.includes('aborted'))
    throw new BffError(
      503,
      'upstream_unavailable',
      aborted ? 'FDSN query timed out' : 'FDSN network error',
    )
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new BffError(
      502,
      'upstream_bad_response',
      `FDSN HTTP ${response.status}`,
    )
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new BffError(
      502,
      'upstream_bad_response',
      'FDSN returned non-JSON body',
    )
  }

  // Validacion provisional (#70); #71 endurece schema FDSN dedicado.
  const parsed = fdsnFeatureCollectionProvisionalSchema.safeParse(json)
  if (!parsed.success) {
    throw new BffError(
      502,
      'upstream_bad_response',
      'FDSN payload failed schema validation',
    )
  }

  const earthquakes = parsed.data.features.map(toEarthquakeSummary)
  return {
    fetchedAt: Date.now(),
    stale: false,
    count: earthquakes.length,
    earthquakes,
    query: params,
  }
}
