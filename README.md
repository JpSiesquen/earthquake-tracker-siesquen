# Earthquake Tracker

Visualización sísmica **2D → 3D**: mapa operativo con capas y, al seleccionar un
evento, escena local con profundidad (hipocentro).

No es un globo genérico con puntos. El foco es entender un evento: ubicación,
magnitud y profundidad, con datos USGS a través de un BFF propio.

[![Demo](https://img.shields.io/badge/demo-vercel-black?style=flat-square)](https://earthquake-tracker-siesquen.vercel.app)
[![CI](https://img.shields.io/github/actions/workflow/status/JpSiesquen/earthquake-tracker-siesquen/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/JpSiesquen/earthquake-tracker-siesquen/actions/workflows/ci.yml)

**Demo:** https://earthquake-tracker-siesquen.vercel.app

## Qué hay hoy

- **Capa 1:** mapa MapLibre (círculos, heatmap, placas), filtros, lista, deep link `?event=`
- **Capa 2:** escena R3F en `/event/:id/3d` (plano honesto, epicentro/hipocentro, vecinos FDSN)
- **BFF:** catálogo, detail y search FDSN (Zod + TanStack Query)

## Stack

- Vite, React 19, TypeScript, React Router, Zustand
- MapLibre 6 · Three / R3F / Drei
- BFF serverless (Vercel), oxlint, Prettier, Husky, GitHub Actions (`verificar`)

## Estado

Capa 1 y Capa 2 usables. Siguiente: productos USGS en mapa (Fase 6). El README
público se irá afinando (media y tono portfolio en Fase 7); no es una bitácora.

## Desarrollo

```bash
npm ci
npm run hooks
npm run dev
```

Usa `npm ci` (no `npm install` al clonar). Luego `npm run hooks`: el repo tiene
`ignore-scripts=true` en `.npmrc`, así que Husky no se activa solo. Detalle en
[`CONTRIBUTING.md`](./CONTRIBUTING.md#seguridad-de-dependencias).

Sandbox MapLibre (Fase 0): `python -m http.server 4173` → `/sandbox/maplibre/`.

Más detalle: [`PRODUCT.md`](./PRODUCT.md), [`AGENTS.md`](./AGENTS.md),
[`docs/04-escena-3d.md`](./docs/04-escena-3d.md).
