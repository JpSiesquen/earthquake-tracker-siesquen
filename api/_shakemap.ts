import {
  usgsShakeMapContourCollectionSchema,
  toShakeMapContourFeatures,
  type ShakeMapContoursResponse,
} from '../shared/shakemap.js'

import {
  readLastGoodShakeMapCache,
  readShakeMapCache,
  writeShakeMapCache,
} from './_cache.js'
import { getEarthquakeDetail } from './_detail.js'
import { BffError } from './_errors.js'
import { fetchUsgsProductJson, isUsgsEventId } from './_usgs.js'

/**
 * Contornos MMI: detail → URL → fetch USGS → Zod → DTO propio.
 * Cache propia (no mezcla TTL con catálogo/detail).
 */
export async function getShakeMapContours(
  id: string,
): Promise<ShakeMapContoursResponse> {
  if (!isUsgsEventId(id)) {
    throw new BffError(400, 'bad_request', 'Invalid earthquake id')
  }

  const cached = readShakeMapCache(id)
  if (cached) return cached

  const detail = await getEarthquakeDetail(id)
  const { available, contourMiUrl } = detail.products.shakemap

  if (!available || contourMiUrl === null) {
    throw new BffError(
      404,
      'not_found',
      available
        ? 'ShakeMap sin URL de contornos MMI'
        : 'Sin ShakeMap en este evento',
    )
  }

  try {
    const json = await fetchUsgsProductJson(contourMiUrl, 'ShakeMap contours')
    const parsed = usgsShakeMapContourCollectionSchema.safeParse(json)
    if (!parsed.success) {
      throw new BffError(
        502,
        'upstream_bad_response',
        'ShakeMap contours failed schema validation',
      )
    }

    const body: ShakeMapContoursResponse = {
      fetchedAt: Date.now(),
      contourMiUrl,
      deferred: false,
      type: 'FeatureCollection',
      features: toShakeMapContourFeatures(parsed.data),
    }
    writeShakeMapCache(id, body)
    return body
  } catch (error) {
    const fallback = readLastGoodShakeMapCache(id)
    if (fallback) {
      return { ...fallback, fetchedAt: fallback.fetchedAt }
    }
    if (error instanceof BffError) throw error
    throw new BffError(
      503,
      'upstream_unavailable',
      'Unexpected ShakeMap contours failure',
    )
  }
}
