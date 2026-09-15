import type { CatalogResponse } from '../../shared/catalog.ts'
import type { CatalogWindow } from '../../shared/window.ts'
import type { BffErrorBody } from '../../shared/errors.ts'

export async function fetchEarthquakes(
  window: CatalogWindow,
): Promise<CatalogResponse> {
  const res = await fetch(`/api/earthquakes?window=${window}`)
  if (!res.ok) {
    let detail = `earthquakes failed: ${res.status}`
    try {
      const body = (await res.json()) as BffErrorBody
      if (body?.message) detail = body.message
    } catch {
      // ignore
    }
    throw new Error(detail)
  }
  return (await res.json()) as CatalogResponse
}
