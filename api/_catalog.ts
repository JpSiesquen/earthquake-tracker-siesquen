import type { CatalogResponse } from '../shared/catalog.js'
import type { CatalogWindow } from '../shared/window.js'

import { readCache, readLastGood, writeCache } from './_cache.js'
import { BffError } from './_errors.js'
import { emscFeatureToSummary, fetchEmscCollection } from './_emsc.js'
import { mergeUsgsAndEmscCatalogs } from './_mergeCatalog.js'
import { toEarthquakeSummary } from './_normalize.js'
import { fetchUsgsCollection } from './_usgs.js'

/**
 * Catalogo normalizado USGS + complemento EMSC (dedup).
 * Cache en memoria + marcador stale si USGS falla y hay last-good.
 */
export async function getCatalog(
  window: CatalogWindow,
): Promise<CatalogResponse> {
  const cached = readCache(window)
  if (cached) return { ...cached, stale: false }

  try {
    const usgsSettled = await Promise.allSettled([
      fetchUsgsCollection(window),
      fetchEmscCollection(window),
    ])

    const usgsResult = usgsSettled[0]
    const emscResult = usgsSettled[1]

    if (usgsResult.status === 'rejected') {
      const fallback = readLastGood(window)
      if (fallback) {
        return { ...fallback, stale: true }
      }
      throw usgsResult.reason
    }

    const usgs = usgsResult.value.features.map(toEarthquakeSummary)
    const emsc =
      emscResult.status === 'fulfilled'
        ? emscResult.value.features.map(emscFeatureToSummary)
        : []

    const earthquakes = mergeUsgsAndEmscCatalogs(usgs, emsc)
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
