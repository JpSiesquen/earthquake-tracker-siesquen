/** staleTime del catalogo en el cliente (ms). Alineado al TTL tipico del BFF. */
export const EARTHQUAKES_STALE_TIME_MS = 5 * 60 * 1000

/** staleTime del detail (ms). Alineado al TTL corto del BFF (~60s). */
export const EARTHQUAKE_DETAIL_STALE_TIME_MS = 60 * 1000

export const EARTHQUAKES_QUERY_RETRIES = 2
