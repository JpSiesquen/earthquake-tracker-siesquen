import type { BffErrorBody } from '../../shared/errors.ts'
import type { EarthquakeId } from '../../shared/earthquake.ts'
import type { ShakeMapContoursResponse } from '../../shared/shakemap.ts'

/**
 * Contornos MMI vía BFF. El browser no llama a USGS ni CDN de products.
 */
export async function fetchShakeMapContours(
  id: EarthquakeId,
): Promise<ShakeMapContoursResponse> {
  const res = await fetch(`/api/earthquakes/${encodeURIComponent(id)}/shakemap`)
  if (!res.ok) {
    let detail = `shakemap contours failed: ${res.status}`
    try {
      const body = (await res.json()) as BffErrorBody
      if (body?.message) detail = body.message
    } catch {
      // ignore
    }
    throw new Error(detail)
  }
  return (await res.json()) as ShakeMapContoursResponse
}
