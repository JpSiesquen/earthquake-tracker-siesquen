# earthquake-tracker-siesquen

Visualizacion sismica 2D/3D: catalogo USGS via BFF, mapa MapLibre multicapa y escena
local (R3F) con profundidad al seleccionar un evento.

**Demo:** pendiente de URL Vercel (conectar el proyecto en el dashboard).

## Fuente de verdad para agentes

Este `AGENTS.md` es el unico documento de contexto activo (Cursor, Codex u otro).
No crear `CLAUDE.md` en este repo.

| Documento | Rol | Repo |
| --- | --- | --- |
| `AGENTS.md` | Estado, stack, convenciones, siguiente trabajo | Si |
| `PRODUCT.md` | Tesis, voz, anti-referencias | Si |
| `CONTRIBUTING.md` | Flujo issue-PR-CI, labels, npm ci | Si |
| `PLAN.md` | Plan interno | No (gitignore) |
| `Notas/` | Estudio y handoff local | No (gitignore) |

Al cerrar una issue que cambie estado o arquitectura, actualiza `AGENTS.md` en el mismo PR.

## Estado

Fase 0 (sandbox MapLibre) y Fase 1 (andamiaje) cerradas: Vite app, CI
`verificar`, hooks, docs de proceso, proxy `/api`, README.

| Fase | Foco | Estado |
| --- | --- | --- |
| 0 | Sandbox MapLibre | Hecha |
| 1 | Andamiaje + README semilla | Hecha |
| 2 | BFF + catalogo vivo | Pendiente |
| 3 | Mapa 2D producto (Capa 1, corte natural) | Pendiente |
| 4-7 | Detail/FDSN/DEM, 3D, productos USGS, cierre | Pendiente |

**Siguiente:** Fase 2 (`#29+`), BFF + catalogo USGS vivo.

## Stack

- Front: Vite, React 19, TypeScript, MapLibre (producto), R3F (Capa 2)
- Datos: BFF serverless, Zod, TanStack Query, Zustand
- Calidad: oxlint, Prettier, Husky, GitHub Actions (`verificar`)
- Hosting: Vercel (`vercel.json` presente)

## Comandos

```bash
npm ci
npm run hooks
npm run dev
npm run build
npm run lint
npm run format:check
```

Tras clonar: `npm ci` + `npm run hooks`. Sin el segundo, no hay Husky
(`ignore-scripts=true`).

Sandbox Fase 0: `python -m http.server 4173` y abrir `/sandbox/maplibre/`.

## Convenciones

- Flujo: issue → rama → PR → CI verde → merge (`Closes #N`)
- Sin DB/auth/prediccion/Cesium/MUI en el alcance acordado
- Look laboratorio; no clonar visualmente el ISS Tracker
- `.npmrc`: `ignore-scripts=true` (mitiga worms tipo Shai-Hulud) y
  `save-exact=true`; ver CONTRIBUTING
