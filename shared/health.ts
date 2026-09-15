/**
 * Respuesta de `GET /api/health`.
 * Compartida entre BFF y cliente para no divergir el contrato de smoke.
 */
export type HealthResponse = {
  ok: true
  service: 'earthquake-tracker-bff'
  timestamp: number
}
