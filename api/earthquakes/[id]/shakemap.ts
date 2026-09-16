/**
 * Contornos MMI: `GET /api/earthquakes/:id/shakemap`.
 *
 * #100: stub de contrato — si el detail tiene `contourMiUrl`, responde 200
 * diferido sin pegarle a USGS. #101 descarga y valida el GeoJSON.
 */
import { getEarthquakeDetail } from '../../_detail.js'
import { BffError, jsonError } from '../../_errors.js'
import { isUsgsEventId } from '../../_usgs.js'
import type { ShakeMapContoursResponse } from '../../../shared/shakemap.js'

const CACHE_CONTROL = 'public, s-maxage=120, stale-while-revalidate=300'

function readIdFromRequest(request: Request): string | null {
  const pathname = new URL(request.url).pathname
  const match = pathname.match(/\/api\/earthquakes\/([^/]+)\/shakemap\/?$/)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const id = readIdFromRequest(request)
    if (id === null || !isUsgsEventId(id)) {
      throw new BffError(400, 'bad_request', 'Invalid earthquake id')
    }

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

    const body: ShakeMapContoursResponse = {
      fetchedAt: Date.now(),
      contourMiUrl,
      deferred: true,
      type: 'FeatureCollection',
      features: [],
    }

    return Response.json(body, {
      headers: {
        'cache-control': detail.stale ? 'no-store' : CACHE_CONTROL,
      },
    })
  } catch (error) {
    if (error instanceof BffError) return jsonError(error)
    return jsonError(
      new BffError(503, 'upstream_unavailable', 'Unexpected server error'),
    )
  }
}
