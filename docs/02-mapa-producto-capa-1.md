# Mapa 2D de producto (Capa 1)

Resumen tecnico del mapa React. No es tutorial ni material de entrevista.

Vocabulario style/source/layer del sandbox: [`docs/00-maplibre-basico.md`](./00-maplibre-basico.md).
Registro XSS MapLibre: [`docs/01-maplibre-xss-ghsa.md`](./01-maplibre-xss-ghsa.md).

## Rol

Capa 1 es el **corte natural** del portfolio: mapa operativo alimentado por el BFF
(`EarthquakeSummary` via TanStack Query), no GeoJSON USGS crudo en el browser.

```text
useEarthquakes(window)
  → filterEarthquakes (mag ∧ profundidad)
  → GeoJSON source + layers MapLibre
  → selectedId (Zustand) ↔ lista ↔ ?event=
```

## Piezas

| Pieza | Donde |
| --- | --- |
| Ciclo de vida MapLibre | `src/map/MapView.tsx` (create en effect, `map.remove()` en cleanup) |
| Worker ESM | `maplibregl.setWorkerUrl(...)` (Vite `?worker&url`) |
| Basemap | OpenFreeMap Liberty (`src/map/basemap.ts`) |
| Capas | Circulos (mag/profundidad), placas PB2002, heatmap (off por defecto) |
| Estado UI | Zustand `selectedId` (`src/store/earthquakeSelection.ts`) |
| Catalogo | TanStack Query (`useEarthquakes`); no vive en Zustand |
| Deep link | `?event=` (`src/map/eventSearchParam.ts`, `useEventDeepLink.ts`) |
| Presets | Global / LATAM / Anillo de Fuego (`src/map/mapPresets.ts`) |
| Shell | Mapa + panel desktop (`map-shell`) |
| CTA 3D | Visible con seleccion; disabled + copy honesto (sin R3F falso) |

## Capas (orden visual)

1. Basemap (style remoto).
2. Placas tectonicas (lineas; por debajo de sismos).
3. Heatmap (misma source que circulos; apagado por defecto).
4. Circulos: radio por magnitud, color por profundidad, stroke por `feature-state.selected`.

Toggles en UI propia (`LayerControl`), no controles stock de MapLibre.

## Filtros

AND entre magnitud minima, profundidad maxima y ventana `day|week`.
Eventos con mag o profundidad desconocida no entran a la vista filtrada.
Cambiar ventana dispara refetch (`queryKey` aislada por window).

## Presets de camara

Solo `center` + `zoom` (orden GeoJSON `[lon, lat]`). Evitar `fitBounds` muy anchos:
en viewports desktop empujan Atlantico/Africa al encuadrar LATAM.

| Preset | Centro aprox. | Zoom |
| --- | --- | --- |
| Global | `[0, 12]` | 1.35 |
| LATAM | `[-72, -15]` | 2.55 |
| Anillo de Fuego | `[-160, 5]` | 1.6 |

## Deep link

- Abrir `/?event=<id>` selecciona si el id esta en el catalogo cargado.
- Seleccion manual actualiza la URL con `history.replaceState`.
- Id ausente: no crash; no se inventa ficha.

## Fuera de Capa 1

Detalle USGS, vecinos FDSN, escena R3F y productos (ShakeMap/PAGER/DYFI) son
Fases 4–6. El CTA «Abrir 3D» no finge una escena.
