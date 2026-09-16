/** staleTime del catalogo en el cliente (ms). Alineado al TTL tipico del BFF. */
export const EARTHQUAKES_STALE_TIME_MS = 5 * 60 * 1000

/** staleTime del detail (ms). Alineado al TTL corto del BFF (~60s). */
export const EARTHQUAKE_DETAIL_STALE_TIME_MS = 60 * 1000

export const EARTHQUAKES_QUERY_RETRIES = 2

/** Vecinos (#73): media bbox en grados alrededor del foco. */
export const NEIGHBOR_BBOX_HALF_SPAN_DEG = 2

/** Vecinos: media ventana temporal alrededor de `timeMs` del foco. */
export const NEIGHBOR_TIME_HALF_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

export const NEIGHBOR_MIN_MAGNITUDE = 2

export const NEIGHBOR_LIMIT = 50
