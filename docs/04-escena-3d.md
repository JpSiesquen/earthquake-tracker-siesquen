# Escena 3D local (Capa 2)

Convenio de unidades y exageración para interpretar la escena R3F sin leer todo el código. ADR de suelo: [`adr-dem.md`](./adr-dem.md) (plano default; DEM opcional con fallback en addendum Fase 9).

## Modelo

Origen local = epicentro del evento foco. Unidades = **kilómetros**.

| Eje | Significado |
| --- | --- |
| +X | Este |
| -Z | Norte |
| -Y | Profundidad (bajo la superficie) |

Proyección geográfica: equirectangular local (`projectLatLonToLocalXZ`). Adecuada a vecinos a escala local (±2°); no es una proyección global.

## Profundidad

```text
Y = -depthKm × 1.5
```

- Exageración vertical fija: **1.5×** (`DEFAULT_VERTICAL_EXAGGERATION`).
- `depthKm === null` → no se dibuja hipocentro ni conector (no se finge Y=0).
- El plano de referencia está en Y=0 (500 km de lado); no es topografía real.

## Lectura visual

| Elemento | Qué representa |
| --- | --- |
| Diana azul en Y=0 | Epicentro |
| Octaedro cálido en Y&lt;0 | Hipocentro del foco |
| Segmento vertical | Relación epicentro–hipocentro |
| Esferas | Vecinos FDSN; radio ∝ magnitud; color = banda de profundidad (mismas que el mapa 2D: &lt;70 / 70–300 / ≥300 km) |

Cap de vecinos en escena: 50 (`NEIGHBOR_LIMIT`).

## Límites del modelo

- Suelo default: plano honesto en Y=0 (ADR). DEM es **opcional** (addendum
  Fase 9 en [`adr-dem.md`](./adr-dem.md)): si el fetch falla, se mantiene el
  plano; el deep link 3D no depende de elevación.
- Formato de referencia para un futuro mesh: [`dem-spike.md`](./dem-spike.md)
  (Terrarium); el spike no fija host.
- Sin pan de cámara; órbita limitada para no cruzar el plano.
- Deep link: `/event/:id/3d` rehidrata detail/neighbors vía BFF.

## Verificación

`npm run test:local-coordinates` (CI `verificar`) cubre origen XZ, offsets y depth→Y.
