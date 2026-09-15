/** Query param para deep link de evento seleccionado. */
export const EVENT_SEARCH_PARAM = 'event'

/**
 * Lee `?event=` del search actual (o el que se pase).
 * Cadena vacia / solo espacios → null.
 */
export function readEventIdFromSearch(
  search: string = globalThis.location.search,
): string | null {
  const raw = new URLSearchParams(search).get(EVENT_SEARCH_PARAM)
  if (raw === null) return null

  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Escribe o borra `?event=` con `history.replaceState` (sin apilar historial).
 * No toca pathname ni hash.
 */
export function writeEventIdToUrl(id: string | null): void {
  const url = new URL(globalThis.location.href)

  if (id === null) {
    url.searchParams.delete(EVENT_SEARCH_PARAM)
  } else {
    url.searchParams.set(EVENT_SEARCH_PARAM, id)
  }

  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`
  if (next === current) return

  globalThis.history.replaceState(globalThis.history.state, '', next)
}
