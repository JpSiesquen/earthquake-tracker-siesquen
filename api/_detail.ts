import type { EarthquakeDetailResponse } from '../shared/detail.js'

import {
  readDetailCache,
  readLastGoodDetail,
  writeDetailCache,
} from './_cache.js'
import { BffError } from './_errors.js'
import { toEarthquakeSummary, toEarthquakeProducts } from './_normalize.js'
import { fetchUsgsDetailFeature, isUsgsEventId } from './_usgs.js'

/**
 * Detail normalizado con cache corta + marcador stale.
 */
export async function getEarthquakeDetail(
  id: string,
): Promise<EarthquakeDetailResponse> {
  if (!isUsgsEventId(id)) {
    throw new BffError(400, 'bad_request', 'Invalid earthquake id')
  }

  const cached = readDetailCache(id)
  if (cached) return { ...cached, stale: false }

  try {
    const { feature, usgsUrl } = await fetchUsgsDetailFeature(id)
    const body: EarthquakeDetailResponse = {
      fetchedAt: Date.now(),
      stale: false,
      earthquake: toEarthquakeSummary(feature),
      usgsUrl,
      products: toEarthquakeProducts(feature),
    }
    writeDetailCache(id, body)
    return body
  } catch (error) {
    const fallback = readLastGoodDetail(id)
    if (fallback) {
      return { ...fallback, stale: true }
    }
    if (error instanceof BffError) throw error
    throw new BffError(503, 'upstream_unavailable', 'Unexpected detail failure')
  }
}
