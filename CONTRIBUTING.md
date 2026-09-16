# Contribuir

Convenciones de desarrollo del proyecto.

## Flujo

```text
issue → rama → PR → CI verde (check verificar) → merge
```

- **Una issue por PR.** En el cuerpo del PR: `Closes #N` (en ingles).
- No agrupar una fase o un lote de issues en un solo PR, aunque el corte tecnico
  sea vertical. Si el trabajo es grande, partirlo en issues mas chicas.
- No push directo a `main` (branch protection exige `verificar`).
- No cerrar issues a mano con un comentario "Hecho".

## Puesta en marcha

```bash
npm ci
npm run hooks
npm run dev
```

`npm run hooks` se ejecuta a mano: el repo usa `ignore-scripts=true`, asi que Husky no se instala solo.

| Script | Que hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Tipos + build a `dist/` |
| `npm run lint` | oxlint |
| `npm run format` | Prettier (escribe) |
| `npm run format:check` | Prettier (solo comprueba; lo usa el CI) |
| `npm run preview` | Sirve el build local |
| `npm run hooks` | Instala hooks de git |
| `npm run test:local-coordinates` | Proyeccion lat/lon a XZ locales |
| `npm run test:usgs-schema` | Fixtures Zod del feed USGS |

### `npm ci`, no `npm install`

Para instalar lo existente: `npm ci`. Respeta el lockfile. `npm install` solo al anadir un paquete nuevo.

### BFF / cache USGS

`GET /api/earthquakes?window=day|week`. TTL en memoria: env `USGS_CACHE_TTL_MS`
(default 300000). En local sin funciones: proxy Vite al origen Vercel, o
`vercel dev`.

## Seguridad de dependencias

`.npmrc`:

```ini
ignore-scripts=true
save-exact=true
```

`ignore-scripts=true` evita que `npm ci` / `npm install` ejecuten scripts de
paquetes (`postinstall`, etc.). Eso corta el vector tipico de worms npm como
Shai-Hulud (2025): payload en install, robo de tokens y abuso de repos en
GitHub. El costo es activar Husky a mano con `npm run hooks` tras clonar.

`save-exact=true` fija versiones exactas en el lockfile al anadir dependencias.
No sustituye revisar el changelog o el diff del lock antes de mergear.

## Labels

| Familia | Ejemplos |
| --- | --- |
| Tipo | `bug`, `enhancement`, `chore`, `documentation`, `question` |
| Dificultad | `dificultad:facil`, `dificultad:media`, `dificultad:dificil` (mide riesgo, no tamano) |
| Area | `area:mapa`, `area:3d`, `area:datos`, `area:bff`, `area:ui`, `area:infra`, `area:docs` |
| Prioridad | `priority:critical`, `priority:high`, `priority:medium`, `priority:low` |

Titulos de issue: prefijo `F-N ·` (fase-orden), p. ej. `1-12 · CONTRIBUTING.md`.

## Hooks

El `pre-commit` bloquea `PLAN.md`, `Notas/`, `.env*`, `.vercel/` y patrones tipicos de secretos; luego corre lint-staged.
