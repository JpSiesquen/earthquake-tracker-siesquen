import type { HealthResponse } from '../../shared/health.ts'

/**
 * Cliente del smoke BFF. Tipado desde `shared/` (mismo contrato que `api/health`).
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health')
  if (!res.ok) {
    throw new Error(`health failed: ${res.status}`)
  }
  return (await res.json()) as HealthResponse
}
