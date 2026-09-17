# Bundle y carga (nota corta)

MapLibre y R3F no son baratos. Corte actual del producto (medido con
`npm run build` en cierre de Fase 7; los hashes de archivo cambian entre builds):

| Chunk | Rol | Orden de magnitud |
| --- | --- | --- |
| `index-*.js` | Shell + mapa (MapLibre en el cliente) | ~1.3 MB minificado / ~370 kB gzip |
| `maplibre-gl-worker-*.js` | Worker MapLibre (Vite `?worker&url`) | ~500 kB |
| `EventSceneCanvas-*.js` | Escena Three/R3F (lazy) | ~900 kB / ~240 kB gzip |

## Qué entra y qué no

- La ruta 2D carga el shell y MapLibre. El worker de MapLibre va aparte.
- `EventSceneCanvas` se carga con `React.lazy` desde `Event3DPage` al entrar a
  `/event/:id/3d`. Three/R3F/Drei **no** van en el primer paint del mapa si no
  abres la escena.
- `Event3DPage` (overlay, layout, queries) sí está en el grafo de rutas de
  `main.tsx` (import estático). El peso pesado es el canvas, no el shell 3D.

Nada de "blazing fast": el mapa es WebGL y el 3D es un segundo payload a
propósito. Si un reclutador pregunta "qué pesa", la respuesta es: mapa en el
bundle principal; escena 3D diferida.
