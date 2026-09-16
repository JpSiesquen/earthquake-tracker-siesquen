/**
 * Detalle de un evento: `GET /api/earthquakes/:id`.
 *
 * Fetch USGS solo en servidor. Shape provisional (#67); Zod detail en #68.
 */
import { getEarthquakeDetail } from '../_detail.js'
import { BffError, jsonError } from '../_errors.js'
import { isUsgsEventId } from '../_usgs.js'

const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=120'

function readIdFromRequest(request: Request): string | null {
  const pathname = new URL(request.url).pathname
  const match = pathname.match(/\/api\/earthquakes\/([^/]+)\/?$/)
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
    if (id === null || id === 'search' || !isUsgsEventId(id)) {
      throw new BffError(400, 'bad_request', 'Invalid earthquake id')
    }

    const body = await getEarthquakeDetail(id)
    return Response.json(body, {
      headers: {
        'cache-control': body.stale ? 'no-store' : CACHE_CONTROL,
      },
    })
  } catch (error) {
    if (error instanceof BffError) return jsonError(error)
    return jsonError(
      new BffError(503, 'upstream_unavailable', 'Unexpected server error'),
    )
  }
}
