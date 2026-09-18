import {
  emscFeatureCollectionSchema,
  emscFeatureSchema,
  emscUnidFromCatalogId,
  isEmscEventId,
  toEmscCatalogId,
  type EmscFeature,
  type EmscFeatureCollection,
} from '../shared/emsc.js'
import type { EarthquakeSummary } from '../shared/earthquake.js'
import type { CatalogWindow } from '../shared/window.js'

import { BffError } from './_errors.js'

const EMSC_QUERY_URL = 'https://www.seismicportal.eu/fdsnws/event/1/query'
const USER_AGENT =
  'earthquake-tracker-siesquen/0.0.0 (+https://earthquake-tracker-siesquen.vercel.app)'
const TIMEOUT_MS = 10_000
/** Evita inundar el mapa con micro-sismos EMSC; USGS sigue trayendo el resto. */
const EMSC_MIN_MAGNITUDE = 2.5
const EMSC_LIMIT = 400

export { isEmscEventId, emscUnidFromCatalogId, toEmscCatalogId }

function windowStartIso(window: CatalogWindow): string {
  const ms = window === 'day' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  return new Date(Date.now() - ms).toISOString()
}

async function fetchEmscJson(url: string, label: string): Promise<unknown> {
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
      aborted ? `${label} timed out` : `${label} network error`,
    )
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 204) {
    return { type: 'FeatureCollection', features: [] }
  }

  if (!response.ok) {
    throw new BffError(
      502,
      'upstream_bad_response',
      `${label} HTTP ${response.status}`,
    )
  }

  try {
    return await response.json()
  } catch {
    throw new BffError(
      502,
      'upstream_bad_response',
      `${label} returned non-JSON body`,
    )
  }
}

/**
 * Feed EMSC para la misma ventana day/week del catalogo USGS.
 */
export async function fetchEmscCollection(
  window: CatalogWindow,
): Promise<EmscFeatureCollection> {
  const params = new URLSearchParams({
    format: 'json',
    orderby: 'time',
    limit: String(EMSC_LIMIT),
    minmag: String(EMSC_MIN_MAGNITUDE),
    start: windowStartIso(window),
  })
  const json = await fetchEmscJson(`${EMSC_QUERY_URL}?${params}`, 'EMSC feed')
  const parsed = emscFeatureCollectionSchema.safeParse(json)
  if (!parsed.success) {
    throw new BffError(
      502,
      'upstream_bad_response',
      'EMSC feed failed schema validation',
    )
  }
  return parsed.data
}

export async function fetchEmscFeatureByUnid(
  unid: string,
): Promise<EmscFeature> {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(unid)) {
    throw new BffError(400, 'bad_request', 'Invalid EMSC event id')
  }
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    unid,
  })
  const json = await fetchEmscJson(`${EMSC_QUERY_URL}?${params}`, 'EMSC detail')
  const collection = emscFeatureCollectionSchema.safeParse(json)
  if (collection.success && collection.data.features[0]) {
    return collection.data.features[0]
  }
  // Algunos despliegues devuelven Feature suelto.
  const single = emscFeatureSchema.safeParse(json)
  if (single.success) {
    return single.data
  }
  throw new BffError(404, 'not_found', 'EMSC event not found')
}

/** EMSC Feature → DTO interno. */
export function emscFeatureToSummary(feature: EmscFeature): EarthquakeSummary {
  const unid = feature.properties.unid ?? feature.id
  const [longitude, latitude] = feature.geometry.coordinates
  const depthFromProps = feature.properties.depth
  const depthKm =
    typeof depthFromProps === 'number' && Number.isFinite(depthFromProps)
      ? Math.abs(depthFromProps)
      : Math.abs(feature.geometry.coordinates[2] ?? 0)

  const timeMs = Date.parse(feature.properties.time)
  if (!Number.isFinite(timeMs)) {
    throw new BffError(
      502,
      'upstream_bad_response',
      'EMSC time is not parseable',
    )
  }

  const region = feature.properties.flynn_region?.trim()
  const auth = feature.properties.auth?.trim()
  const place = region
    ? auth
      ? `${region} (EMSC/${auth})`
      : `${region} (EMSC)`
    : 'EMSC event'

  return {
    id: toEmscCatalogId(unid),
    magnitude: feature.properties.mag,
    place,
    timeMs,
    depthKm,
    coordinates: [longitude, latitude],
  }
}
