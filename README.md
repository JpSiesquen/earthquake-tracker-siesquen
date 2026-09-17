# Earthquake Tracker

Visualización sísmica **2D → 3D**: catálogo USGS vía BFF, mapa operativo multicapa
y escena local con profundidad (hipocentro) al seleccionar un evento.

Tesis: del mapa 2D al volumen tectónico. No es otro globo con puntos; hay frontera
de datos e ingeniería detrás.

[![Demo](https://img.shields.io/badge/demo-vercel-black?style=flat-square)](https://earthquake-tracker-siesquen.vercel.app)
[![CI](https://img.shields.io/github/actions/workflow/status/JpSiesquen/earthquake-tracker-siesquen/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/JpSiesquen/earthquake-tracker-siesquen/actions/workflows/ci.yml)

**Demo:** https://earthquake-tracker-siesquen.vercel.app

## Producto

| Capa | Qué entrega |
| --- | --- |
| **1 · Mapa** | MapLibre: círculos por magnitud, color por profundidad, heatmap, placas, filtros, lista, deep link `?event=` |
| **2 · Escena** | R3F en `/event/:id/3d`: plano honesto, epicentro vs hipocentro, vecinos FDSN |
| **3 · Products** | ShakeMap MMI en mapa, PAGER y DYFI en ficha, con degradación limpia |

El navegador **no** habla con `earthquake.usgs.gov`. Todo pasa por el BFF
(`/api/earthquakes`, `/:id`, `/:id/shakemap`, `/search`) con validación Zod y caché.

## Lo difícil (a propósito)

- **Frontera USGS:** products incompletos, URLs que faltan, contornos vacíos. La UI
  muestra ausencia / carga / error / listo; no inventa geometría.
- **DTO de products:** el BFF normaliza flags y metadatos útiles; no expone el árbol
  crudo de `properties.products`.
- **Plano honesto:** sin DEM de producción (ADR). La escena explica profundidad sin
  fingir relieve.
- **Anti-prediccion:** el M–t de vecinos es exploratorio, con disclaimer visible.

## Stack

Vite · React 19 · TypeScript · MapLibre 6 · Three / R3F / Drei · Zustand · TanStack
Query · React Router · BFF serverless (Vercel) · oxlint · Prettier · Husky · Actions
(`verificar`)

## Estado

Capas 1–3 usables en demo. Fase 7: README/docs en curso; capturas/GIF de portfolio
al final (#112–#114), cuando el pulido UI esté cerrado.

## Desarrollo

```bash
npm ci
npm run hooks
npm run dev
```

Usa `npm ci` (no `npm install` al clonar). Luego `npm run hooks`: el repo tiene
`ignore-scripts=true` en `.npmrc`. Detalle en
[`CONTRIBUTING.md`](./CONTRIBUTING.md#seguridad-de-dependencias).

```bash
npm run build
npm run lint
npm run format:check
npm run test:local-coordinates
npm run test:usgs-schema
```

Sandbox MapLibre (Fase 0): `python -m http.server 4173` → `/sandbox/maplibre/`.

## Docs

- [`PRODUCT.md`](./PRODUCT.md) · tesis y voz
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) · issue → PR → CI
- [`AGENTS.md`](./AGENTS.md) · estado para agentes
- [`docs/02-mapa-producto-capa-1.md`](./docs/02-mapa-producto-capa-1.md) · mapa 2D
- [`docs/04-escena-3d.md`](./docs/04-escena-3d.md) · unidades y exageración 3D
- [`docs/adr-dem.md`](./docs/adr-dem.md) · por qué no hay DEM en producción
