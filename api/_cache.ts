import type { CatalogResponse } from '../shared/catalog.js'
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

type Entry = {
  body: CatalogResponse
  savedAt: number
}

const memory = new Map<CatalogWindow, Entry>()

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
