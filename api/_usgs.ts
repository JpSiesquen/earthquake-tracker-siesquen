import {
  usgsDetailFeatureSchema,
  usgsFeatureCollectionSchema,
  type UsgsDetailFeature,
  type UsgsFeatureCollection,
} from '../shared/usgs.js'
import type { CatalogWindow } from '../shared/window.js'

import { BffError } from './_errors.js'

const FEED_URL: Record<CatalogWindow, string> = {
  day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
}

const DETAIL_URL_PREFIX =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/'

const USER_AGENT =
  'earthquake-tracker-siesquen/0.0.0 (+https://earthquake-tracker-siesquen.vercel.app)'

/** Timeout upstream (ms). Sin timeout, la serverless se cuelga hasta el limite de Vercel. */
const TIMEOUT_MS = 10_000

/**
 * Ids USGS tipicos: `us7000pn9s`, `ci39818991`.
 * Rechaza vacio, path traversal y caracteres raros antes de pegar la URL.
 */
export function isUsgsEventId(raw: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{0,63}$/i.test(raw)
}

async function fetchUsgsJson(url: string, label: string): Promise<unknown> {
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

  if (response.status === 404) {
    throw new BffError(404, 'not_found', `${label} not found`)
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
 * Descarga el feed USGS en el servidor (nunca desde el navegador).
 * Valida el FeatureCollection con Zod antes de devolverlo.
 */
export async function fetchUsgsCollection(
  window: CatalogWindow,
): Promise<UsgsFeatureCollection> {
  const json = await fetchUsgsJson(FEED_URL[window], 'USGS feed')

  const parsed = usgsFeatureCollectionSchema.safeParse(json)
  if (!parsed.success) {
    throw new BffError(
      502,
      'upstream_bad_response',
      'USGS feed failed schema validation',
    )
  }

  return parsed.data
}

/**
 * Detail USGS por event id (Feature GeoJSON).
 * Valida con `usgsDetailFeatureSchema` (#68).
 */
export async function fetchUsgsDetailFeature(id: string): Promise<{
  feature: UsgsDetailFeature
  usgsUrl: string | null
}> {
  if (!isUsgsEventId(id)) {
    throw new BffError(400, 'bad_request', 'Invalid earthquake id')
  }

  const json = await fetchUsgsJson(
    `${DETAIL_URL_PREFIX}${encodeURIComponent(id)}.geojson`,
    'USGS detail',
  )

  const parsed = usgsDetailFeatureSchema.safeParse(json)
  if (!parsed.success) {
    throw new BffError(
      502,
      'upstream_bad_response',
      'USGS detail failed schema validation',
    )
  }

  const url = parsed.data.properties.url
  return {
    feature: parsed.data,
    usgsUrl: typeof url === 'string' && url.trim() ? url : null,
  }
}
