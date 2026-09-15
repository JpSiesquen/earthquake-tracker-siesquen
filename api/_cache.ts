import type { CatalogResponse } from '../shared/catalog.js'
import type { EarthquakeDetailResponse } from '../shared/detail.js'
import type { CatalogWindow } from '../shared/window.js'

/**
 * TTL de la cache en memoria (ms).
 * Override: `USGS_CACHE_TTL_MS` (entero positivo).
 * Default: 5 min (day y week). Optimizacion oportunista en instancia caliente.
 */
export function cacheTtlMs(): number {
  const raw = process.env.USGS_CACHE_TTL_MS
  if (raw) {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return n
  }
  return 5 * 60 * 1000
}

/**
 * TTL corto para detail (ms).
 * Override: `USGS_DETAIL_CACHE_TTL_MS`. Default: 60 s.
 */
export function detailCacheTtlMs(): number {
  const raw = process.env.USGS_DETAIL_CACHE_TTL_MS
  if (raw) {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return n
  }
  return 60 * 1000
}

type Entry = {
  body: CatalogResponse
  savedAt: number
}

type DetailEntry = {
  body: EarthquakeDetailResponse
  savedAt: number
}

const memory = new Map<CatalogWindow, Entry>()
const detailMemory = new Map<string, DetailEntry>()

export function readCache(window: CatalogWindow): CatalogResponse | null {
  const hit = memory.get(window)
  if (!hit) return null
  if (Date.now() - hit.savedAt > cacheTtlMs()) return null
  return hit.body
}

/** Ultima respuesta buena aunque este fuera de TTL (fallback stale). */
export function readLastGood(window: CatalogWindow): CatalogResponse | null {
  return memory.get(window)?.body ?? null
}

export function writeCache(body: CatalogResponse): void {
  memory.set(body.window, { body, savedAt: Date.now() })
}

export function readDetailCache(id: string): EarthquakeDetailResponse | null {
  const hit = detailMemory.get(id)
  if (!hit) return null
  if (Date.now() - hit.savedAt > detailCacheTtlMs()) return null
  return hit.body
}

export function readLastGoodDetail(
  id: string,
): EarthquakeDetailResponse | null {
  return detailMemory.get(id)?.body ?? null
}

export function writeDetailCache(
  id: string,
  body: EarthquakeDetailResponse,
): void {
  detailMemory.set(id, { body, savedAt: Date.now() })
}
