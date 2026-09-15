/**
 * Comprobacion de vida del BFF: `GET /api/health`.
 *
 * Primera funcion serverless. No sirve catalogo USGS: solo confirma que la
 * capa `api/` esta desplegada y responde, base del proxy Vite y de Fase 2.
 *
 * Enrutado por archivo: `api/health.ts` → `/api/health` (raiz del repo, no
 * dentro de `src/`). Firma Web estándar (`Request`/`Response`) sin
 * `@vercel/node`, mismo criterio que el ISS Tracker (cero deps extra).
 */
export function GET(): Response {
  return Response.json(
    {
      ok: true,
      service: 'earthquake-tracker-bff',
      timestamp: Date.now(),
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  )
}
