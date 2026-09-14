# Earthquake Tracker

Visualizacion sismica **2D → 3D**: mapa operativo con capas y, al seleccionar un
evento, escena local con profundidad (hipocentro).

No es un globo generico con puntos. El foco es entender un evento: ubicacion,
magnitud y profundidad, con datos USGS atraves de un BFF propio.

## Stack

- Vite, React 19, TypeScript
- MapLibre (mapa 2D), React Three Fiber (escena 3D en fases posteriores)
- BFF serverless, Zod, TanStack Query, Zustand (Fase 2+)
- oxlint, Prettier, Husky, GitHub Actions (`verificar`)
- Vercel

## Demo

Pendiente de URL publica (proyecto Vercel + `vercel.json` ya en el repo).

## Desarrollo

```bash
npm ci
npm run hooks
npm run dev
```

Sandbox MapLibre (Fase 0):

```bash
python -m http.server 4173
```

Abrir `http://localhost:4173/sandbox/maplibre/`.

Mas detalle: [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`PRODUCT.md`](./PRODUCT.md),
[`AGENTS.md`](./AGENTS.md).
