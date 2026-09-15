import {
  usgsFeatureCollectionSchema,
  type UsgsFeatureCollection,
} from '../shared/usgs.js'
import type { CatalogWindow } from '../shared/window.js'

import { BffError } from './_errors.js'

const FEED_URL: Record<CatalogWindow, string> = {
  day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
}

const USER_AGENT =
  'earthquake-tracker-siesquen/0.0.0 (+https://earthquake-tracker-siesquen.vercel.app)'

/** Timeout upstream (ms). Sin timeout, la serverless se cuelga hasta el limite de Vercel. */
const TIMEOUT_MS = 10_000

/**
 * Descarga el feed USGS en el servidor (nunca desde el navegador).
 * Valida el FeatureCollection con Zod antes de devolverlo.
 */
export async function fetchUsgsCollection(
  window: CatalogWindow,
): Promise<UsgsFeatureCollection> {
  const url = FEED_URL[window]
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
      aborted ? 'USGS feed timed out' : 'USGS feed network error',
    )
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new BffError(
      502,
      'upstream_bad_response',
      `USGS feed HTTP ${response.status}`,
    )
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new BffError(
      502,
      'upstream_bad_response',
      'USGS feed returned non-JSON body',
    )
  }

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
