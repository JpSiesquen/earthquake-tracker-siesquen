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
- Anillos de distancia en 50 / 100 / 200 km; ticks de profundidad real junto al
  conector cuando hay `depthKm`.

## Lectura visual

| Elemento | Qué representa |
| --- | --- |
| Diana azul en Y=0 | Epicentro (pulso único; estático con reduced-motion) |
| Octaedro cálido en Y&lt;0 | Hipocentro del foco (más presente que los vecinos) |
| Segmento vertical | Relación epicentro–hipocentro |
| Esferas | Vecinos FDSN atenuados; radio ∝ magnitud; color = banda de profundidad (mismas que el mapa 2D: &lt;70 / 70–300 / ≥300 km). Hover (puntero): tooltip mag / lugar / profundidad. |

Cap de vecinos en escena: 50 (`NEIGHBOR_LIMIT`).

Al montar `/event/:id/3d`, una intro breve acerca la cámara y crece el conector
hasta el hipocentro (si hay `depthKm`). El destino de la intro es un encuadre
calculado según profundidad y dispersión de vecinos. Con
`prefers-reduced-motion: reduce` se salta a la pose final.

## Límites del modelo

- Suelo default: plano honesto en Y=0 (ADR). DEM es **opcional** (addendum
  Fase 9 en [`adr-dem.md`](./adr-dem.md)): si el fetch falla, se mantiene el
  plano; el deep link 3D no depende de elevación.
- Formato / host de referencia: Terrarium en AWS `elevation-tiles-prod`
  ([`dem-spike.md`](./dem-spike.md)). Malla local ~220 km, zoom 9; **agua**
  (elevación ≤ 0) se pinta como superficie marina en Y=0 (sin fingir relieve
  terrestre ni batimetría profunda); **tierra** usa exageración de relieve
  **2.2×** (independiente del 1.5× de profundidad). Sin garantía de uptime del CDN.
- Sin pan de cámara; órbita limitada para no cruzar el plano.
- Iluminación: hemisferio + key/fill; fog ligera; sin sombras ni bloom.
- Deep link: `/event/:id/3d` rehidrata detail/neighbors vía BFF.
- Tooltip de vecinos: interacción por puntero (hover); no hay lista teclado
  dedicada en esta capa.

## Verificación

`npm run test:local-coordinates` (CI `verificar`) cubre origen XZ, offsets y depth→Y.
