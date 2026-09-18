/**
 * Catalogo sismico: `GET /api/earthquakes?window=day|week`.
 *
 * Orquesta fetch USGS + EMSC (servidor), Zod, DTO, cache TTL y errores tipados.
 * Vive en `api/earthquakes/index.ts` para coexistir con `GET .../:id`.
 */
import { isCatalogWindow } from '../../shared/window.js'

import { getCatalog } from '../_catalog.js'
import { BffError, jsonError } from '../_errors.js'

const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300'

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const raw = url.searchParams.get('window') ?? 'day'
    if (!isCatalogWindow(raw)) {
      throw new BffError(
        400,
        'bad_request',
        'Query window must be "day" or "week"',
      )
    }

    const body = await getCatalog(raw)
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
