/**
 * Busqueda FDSN: `GET /api/earthquakes/search`.
 *
 * Query requerida: min/max lat/lon, starttime, endtime, minmagnitude.
 * Opcional: limit (default 100, max 200).
 */
import { fetchFdsnSearch, parseFdsnSearchParams } from '../_fdsn.js'
import { BffError, jsonError } from '../_errors.js'

const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=60'

export async function GET(request: Request): Promise<Response> {
  try {
    const params = parseFdsnSearchParams(new URL(request.url))
    const body = await fetchFdsnSearch(params)
    return Response.json(body, {
      headers: { 'cache-control': CACHE_CONTROL },
    })
  } catch (error) {
    if (error instanceof BffError) return jsonError(error)
    return jsonError(
      new BffError(503, 'upstream_unavailable', 'Unexpected server error'),
    )
  }
}
