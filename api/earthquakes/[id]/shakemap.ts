/**
 * Contornos MMI: `GET /api/earthquakes/:id/shakemap`.
 *
 * Descarga `cont_mi.json` solo en servidor (#101), valida con Zod y
 * devuelve FeatureCollection propio (`properties.mmi`).
 */
import { getShakeMapContours } from '../../_shakemap.js'
import { BffError, jsonError } from '../../_errors.js'
import { isUsgsEventId } from '../../_usgs.js'

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

    const body = await getShakeMapContours(id)
    return Response.json(body, {
      headers: {
        'cache-control': CACHE_CONTROL,
      },
    })
  } catch (error) {
    if (error instanceof BffError) return jsonError(error)
    return jsonError(
      new BffError(503, 'upstream_unavailable', 'Unexpected server error'),
    )
  }
}
