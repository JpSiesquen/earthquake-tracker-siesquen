# Contribuir

Convenciones de desarrollo del proyecto.

## Flujo

```text
issue → rama → PR → CI verde (check verificar) → merge
```

- Una issue por PR. En el cuerpo del PR: `Closes #N` (en ingles).
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

### `npm ci`, no `npm install`

Para instalar lo existente: `npm ci`. Respeta el lockfile. `npm install` solo al anadir un paquete nuevo.

## Seguridad de dependencias

`.npmrc`:

```ini
ignore-scripts=true
save-exact=true
```

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
