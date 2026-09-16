import type { EarthquakeDetailResponse } from '../../shared/detail.ts'
import type { BffErrorBody } from '../../shared/errors.ts'
import type { EarthquakeId } from '../../shared/earthquake.ts'

export async function fetchEarthquakeDetail(
  id: EarthquakeId,
): Promise<EarthquakeDetailResponse> {
  const res = await fetch(`/api/earthquakes/${encodeURIComponent(id)}`)
  if (!res.ok) {
    let detail = `earthquake detail failed: ${res.status}`
    try {
      const body = (await res.json()) as BffErrorBody
      if (body?.message) detail = body.message
    } catch {
      // ignore
    }
    throw new Error(detail)
  }
  return (await res.json()) as EarthquakeDetailResponse
}
