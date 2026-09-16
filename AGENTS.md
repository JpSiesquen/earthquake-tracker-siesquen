# earthquake-tracker-siesquen

Visualizacion sismica 2D/3D: catalogo USGS via BFF, mapa MapLibre multicapa y escena
local (R3F) con profundidad al seleccionar un evento.

**Demo:** https://earthquake-tracker-siesquen.vercel.app

## Fuente de verdad para agentes

Este `AGENTS.md` es el unico documento de contexto activo (Cursor, Codex u otro).
No crear `CLAUDE.md` en este repo.

| Documento | Rol | Repo |
| --- | --- | --- |
| `AGENTS.md` | Estado, stack, convenciones, siguiente trabajo | Si |
| `PRODUCT.md` | Tesis, voz, anti-referencias | Si |
| `CONTRIBUTING.md` | Flujo issue-PR-CI, labels, npm ci | Si |
| `docs/00-maplibre-basico.md` | Modelo style/source/layer (sandbox) | Si |
| `docs/01-maplibre-xss-ghsa.md` | Registro GHSA MapLibre (XSS attribution) | Si |
| `docs/02-mapa-producto-capa-1.md` | Mapa 2D de producto (Capa 1) | Si |
| `docs/03-detalle-fdsn-dem.md` | Detalle, FDSN, ficha, stub 3D (Fase 4) | Si |
| `docs/dem-spike.md` | Spike DEM coste cero (Fase 4) | Si |
| `docs/adr-dem.md` | ADR: plano honesto vs DEM (Capa 2) | Si |
| `PLAN.md` | Plan interno | No (gitignore) |
| `Notas/` | Estudio y handoff local | No (gitignore) |

Al cerrar una issue que cambie estado o arquitectura, actualiza `AGENTS.md` en el mismo PR.

## Estado

Fase 0–4 cerradas. Fase 5 en curso: Capa 2 tiene ruta estable, layout dedicado,
guardrails y canvas R3F vacio con fondo de laboratorio y carga diferida.

| Fase | Foco | Estado |
| --- | --- | --- |
| 0 | Sandbox MapLibre | Hecha |
| 1 | Andamiaje + README semilla | Hecha |
| 2 | BFF + catalogo vivo | Hecha |
| 3 | Mapa 2D producto (Capa 1, corte natural) | Hecha |
| 4 | Detalle, FDSN y spike DEM | Hecha |
| 5 | Escena 3D local (Capa 2) | En curso |
| 6-7 | Productos USGS y cierre | Pendiente |

**Siguiente:** `#82`, camara y OrbitControls con limites.

## Stack

- Front: Vite, React 19, TypeScript, MapLibre 6 (`MapView`, ESM, WebGL2,
  worker Vite explicito); Three 0.186, R3F 9 y Drei 10 en Capa 2
- Datos (hoy): BFF serverless (`/api/earthquakes`, `/:id`, `/search`), Zod,
  TanStack Query
- Estado UI: Zustand (`selectedId` + deep link `?event=`; catalogo en TanStack Query);
  React Router (`/`, `/event/:id/3d` con shell propia y retorno al deep link 2D)
- Calidad: oxlint, Prettier, Husky, GitHub Actions (`verificar`)
- Hosting: Vercel (Production + Preview en PRs)

## Comandos

```bash
npm ci
npm run hooks
npm run dev
npm run build
npm run lint
npm run format:check
npm run test:usgs-schema
```

Tras clonar: `npm ci` + `npm run hooks`. Sin el segundo, no hay Husky
(`ignore-scripts=true`).

Sandbox Fase 0: `python -m http.server 4173` y abrir `/sandbox/maplibre/`.
Su CDN MapLibre debe permanecer en una version parcheada (`>=6.4.1`) y alineada
con la version exacta del producto cuando sea posible. Registro:
[`docs/01-maplibre-xss-ghsa.md`](./docs/01-maplibre-xss-ghsa.md).

## Convenciones

- Flujo duro: **una issue → una rama → un PR → CI verde → merge** (`Closes #N`)
- No agrupar una fase completa en un solo PR
- Sin DB/auth/prediccion/Cesium/MUI en el alcance acordado
- Look laboratorio; no clonar visualmente el ISS Tracker
- `.npmrc`: `ignore-scripts=true` (mitiga worms tipo Shai-Hulud) y
  `save-exact=true`; ver CONTRIBUTING
