import type { EarthquakeDetailResponse } from '../shared/detail.js'

import {
  readDetailCache,
  readLastGoodDetail,
  writeDetailCache,
} from './_cache.js'
import {
  emscFeatureToSummary,
  emscUnidFromCatalogId,
  fetchEmscFeatureByUnid,
  isEmscEventId,
} from './_emsc.js'
import { BffError } from './_errors.js'
import { toEarthquakeSummary, toEarthquakeProducts } from './_normalize.js'
import { fetchUsgsDetailFeature, isUsgsEventId } from './_usgs.js'

const EMPTY_PRODUCTS = {
  shakemap: { available: false, contourMiUrl: null },
  pager: { available: false, alert: null },
  dyfi: { available: false, felt: null, cdi: null },
} as const

/**
 * Detail normalizado con cache corta + marcador stale.
 * Ids `emsc.*` se resuelven contra Seismic Portal (sin products USGS).
 */
export async function getEarthquakeDetail(
  id: string,
): Promise<EarthquakeDetailResponse> {
  if (isEmscEventId(id)) {
    return getEmscDetail(id)
  }

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

async function getEmscDetail(id: string): Promise<EarthquakeDetailResponse> {
  const unid = emscUnidFromCatalogId(id)
  if (!unid) {
    throw new BffError(400, 'bad_request', 'Invalid EMSC earthquake id')
  }

  const cached = readDetailCache(id)
  if (cached) return { ...cached, stale: false }

  try {
    const feature = await fetchEmscFeatureByUnid(unid)
    const body: EarthquakeDetailResponse = {
      fetchedAt: Date.now(),
      stale: false,
      earthquake: emscFeatureToSummary(feature),
      usgsUrl: null,
      products: {
        shakemap: { ...EMPTY_PRODUCTS.shakemap },
        pager: { ...EMPTY_PRODUCTS.pager },
        dyfi: { ...EMPTY_PRODUCTS.dyfi },
      },
    }
    writeDetailCache(id, body)
    return body
  } catch (error) {
    const fallback = readLastGoodDetail(id)
    if (fallback) {
      return { ...fallback, stale: true }
    }
    if (error instanceof BffError) throw error
    throw new BffError(
      503,
      'upstream_unavailable',
      'Unexpected EMSC detail failure',
    )
  }
}
