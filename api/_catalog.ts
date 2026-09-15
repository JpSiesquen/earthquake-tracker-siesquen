import type { CatalogResponse } from '../shared/catalog.js'
import type { CatalogWindow } from '../shared/window.js'

import { readCache, readLastGood, writeCache } from './_cache.js'
import { BffError } from './_errors.js'
import { toEarthquakeSummary } from './_normalize.js'
import { fetchUsgsCollection } from './_usgs.js'

/**
 * Catalogo normalizado con cache en memoria + marcador stale.
 */
export async function getCatalog(
  window: CatalogWindow,
): Promise<CatalogResponse> {
  const cached = readCache(window)
  if (cached) return { ...cached, stale: false }

  try {
    const collection = await fetchUsgsCollection(window)
    const earthquakes = collection.features.map(toEarthquakeSummary)
    const body: CatalogResponse = {
      window,
      fetchedAt: Date.now(),
      stale: false,
      count: earthquakes.length,
      earthquakes,
    }
    writeCache(body)
    return body
  } catch (error) {
    const fallback = readLastGood(window)
    if (fallback) {
      return { ...fallback, stale: true }
    }
    if (error instanceof BffError) throw error
    throw new BffError(
      503,
      'upstream_unavailable',
      'Unexpected catalog failure',
    )
  }
}
