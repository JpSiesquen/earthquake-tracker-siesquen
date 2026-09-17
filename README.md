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
| **Mapa** | MapLibre: magnitud, profundidad, heatmap, placas, filtros, lista, `?event=` |
| **Escena** | R3F `/event/:id/3d`: plano honesto, epicentro vs hipocentro, vecinos FDSN |
| **Products** | ShakeMap MMI, PAGER, DYFI; degradación limpia si USGS no trae dato |

El navegador no llama a USGS: solo al BFF (`/api/earthquakes`, `/:id`,
`/:id/shakemap`, `/search`) con Zod y caché.

## Lo difícil

- Products incompletos → estados ausencia / carga / error / listo; sin geometría inventada
- DTO normalizado en servidor; sin árbol crudo de `properties.products`
- Sin DEM en producción ([ADR](./docs/adr-dem.md)); la escena explica profundidad
- M-t de vecinos exploratorio, con disclaimer (no predicción)

## Stack

Vite · React 19 · TypeScript · MapLibre 6 · Three / R3F / Drei · Zustand · TanStack
Query · React Router · BFF Vercel · oxlint · Prettier · Husky · Actions (`verificar`)

## Estado

Capas 1-3 usables en demo. Pendiente de cierre: media de portfolio (capturas/GIF) y
README bilingüe.

## Desarrollo

```bash
npm ci
npm run hooks
npm run dev
```

`npm ci` + `npm run hooks` (Husky no corre solo: `ignore-scripts=true`). Ver
[`CONTRIBUTING.md`](./CONTRIBUTING.md#seguridad-de-dependencias).

También: `npm run build` · `lint` · `format:check` · `test:local-coordinates` ·
`test:usgs-schema`.

## Docs

[`PRODUCT.md`](./PRODUCT.md) · [`CONTRIBUTING.md`](./CONTRIBUTING.md) ·
[`AGENTS.md`](./AGENTS.md) · [`docs/02-mapa-producto-capa-1.md`](./docs/02-mapa-producto-capa-1.md) ·
[`docs/04-escena-3d.md`](./docs/04-escena-3d.md) · [`docs/adr-dem.md`](./docs/adr-dem.md)
