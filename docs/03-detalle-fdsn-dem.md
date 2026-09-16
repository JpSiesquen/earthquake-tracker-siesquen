# Detalle, FDSN y decision DEM (Fase 4)

Resumen tecnico. Estudio privado: `Notas/fase-4.md` (local).

Spike DEM: [`docs/dem-spike.md`](./dem-spike.md). ADR suelo: [`docs/adr-dem.md`](./adr-dem.md).

## Rol

Fase 4 prepara la ficha y la escena 3D: detail USGS por id, vecinos FDSN,
panel de producto y navegacion a ruta stub — **sin** montar R3F aun.

```text
selectedId
  → GET /api/earthquakes/:id → EarthquakeDetailResponse (+ products flags)
  → GET /api/earthquakes/search → vecinos (bbox/time)
  → ficha + chips
  → CTA → /event/:id/3d (stub)
```

## BFF

| Ruta | Rol |
| --- | --- |
| `GET /api/earthquakes` | Catalogo day/week (Fase 2) |
| `GET /api/earthquakes/:id` | Detail USGS → DTO propio |
| `GET /api/earthquakes/search` | Proxy FDSN (bbox, time, minmag, limit) |

Helpers: `api/_detail.ts`, `api/_fdsn.ts`. Errores tipados incluyen `not_found`.
Cache detail TTL corto (~60s). Limites search: span bbox ≤20°, ventana ≤30 dias,
limit ≤200.

## Contratos (`shared/`)

- `EarthquakeDetailResponse`: summary + `usgsUrl` + `products { shakemap, pager, dyfi }`
- `EarthquakeSearchResponse`: lista de `EarthquakeSummary` + eco de query
- Zod: `usgsDetailFeatureSchema`, `fdsnFeatureCollectionSchema` (+ fixtures CI)

Semantica products: **disponible en USGS** ≠ descargado (contornos = Fase 6).

## Cliente

| Pieza | Archivo |
| --- | --- |
| Detail hook | `useEarthquakeDetail` (`enabled` solo con id) |
| Neighbors hook | `useEarthquakeNeighbors` (bbox ±2°, ±3 dias, minmag 2) |
| Ficha | `EventDetailPanel` |
| CTA 3D | `Open3DCta` → React Router |
| Stub 3D | `Event3DStubPage` en `/event/:id/3d` |

## Decision de suelo (Capa 2)

**Plano honesto** por defecto. DEM free (Terrarium, etc.) queda opcional fuera
del camino critico. Ver ADR.

## Fuera de Fase 4

R3F real, terreno, deep link 3D rico y productos ShakeMap en mapa = Fases 5–6.
