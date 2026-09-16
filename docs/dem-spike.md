# Spike DEM a coste cero

Spike de ingenieria (issue **#76**). No es ADR final — la decision queda en **#77**.

Objetivo: evaluar si hay un DEM usable **sin tarjeta** para la escena 3D local
(Capa 2: un evento + vecinos en un bbox chico), o si el camino honesto es un
**plano** con profundidad en Y.

## Criterios

| Criterio | Que miramos |
| --- | --- |
| Coste | $0 sin cuenta de pago obligatoria |
| Auth | Sin API key, o key gratuita sin tarjeta |
| Licencia | Redistribuible / atribuible en portfolio publico |
| Resolucion | Suficiente para “relieve de laboratorio”, no cartografia oficial |
| Complejidad | Encaje en R3F sin un pipeline de tiles propio |
| Fiabilidad | Rate limits, uptime, riesgo de que el CDN desaparezca |

## Candidatos revisados

### 1. AWS Terrain / Mapzen Terrarium (tiles PNG)

- **Que es:** tiles de elevacion codificados en RGB (formato Terrarium / Tilezen joerd).
- **Acceso:** historicamente via bucket publico de tiles de elevacion (sin key).
- **Coste:** $0 de licencia de tile; ancho de banda del cliente.
- **Pros:** sin auth; mosaico global; patron conocido en demos WebGL.
- **Contras:** dependencia de un host de terceros; hay que decodificar RGB→metros;
  atricion de URL/politica posible; no es un “producto USGS” oficial.
- **Encaje Capa 2:** viable para un bbox local si se limitan zoom/tiles.

Referencia de formato: [tilezen/joerd formats](https://github.com/tilezen/joerd/blob/master/docs/formats.md).

### 2. Open Topo Data (API de puntos)

- **Que es:** API REST de elevacion ([opentopodata.org](https://www.opentopodata.org/)).
- **Acceso:** API publica o self-host.
- **Coste:** publico gratis con **rate limit**; self-host = infra propia.
- **Pros:** API simple (lat/lon → elevacion); datasets documentados.
- **Contras:** para un mesh denso (p. ej. 128×128) el publico no escala; conviene
  self-host o otro camino de raster.
- **Encaje Capa 2:** util para muestrear pocos puntos / validar, no para malla densa
  en el browser via API publica.

### 3. Copernicus DEM / datasets “gratis con registro”

- **Que es:** DEM global de alta calidad (p. ej. GLO-30).
- **Acceso:** suele exigir registro / portal; descarga por escena o mosaico.
- **Coste:** dato gratuito; **operacion** (descarga, recorte, hosteo) no es cero.
- **Pros:** calidad; licencia de uso abierta tipica de Copernicus.
- **Contras:** fuera del presupuesto de un spike de un PR; no es “fetch al vuelo”
  desde el cliente sin BFF + almacenamiento.
- **Encaje Capa 2:** posible en una fase posterior con pipeline offline, no ahora.

### 4. Mapbox / MapTiler terrain

- **Descartados para este spike:** requieren token y condiciones comerciales.
  No cumplen “coste cero / sin tarjeta” como default del portfolio.

### 5. Plano honesto (sin DEM)

- **Que es:** mesh plana en Y=0; hipocentro en profundidad; vecinos en XZ.
- **Coste / auth / licencia:** N/A.
- **Pros:** cero dependencia; tesis 2D→3D (profundidad) se defiende igual;
  menos superficie de fallo en demo.
- **Contras:** no hay relieve; hay que rotularlo como plano, no como “terreno real”.

## Hallazgos (evidencia minima)

1. Existe al menos **un camino free sin key** para raster de elevacion (Terrarium /
   tiles publicos), con trade-offs de hosting y decodificacion.
2. Las APIs de puntos free (Open Topo Data publico) **no** son el camino natural
   para un mesh denso en cliente.
3. DEM “serios” (Copernicus) son free en dato pero **caros en proceso** para este repo.
4. La tesis del producto (**profundidad del hipocentro**) **no depende** del relieve.

## Recomendacion tentativa (no ADR)

Para Fase 5 (Capa 2) en este portfolio:

1. **Preferir plano honesto** como default de entrega (bajo riesgo, narrativa clara).
2. Tratar Terrarium / tiles free como **opcional posterior** si sobra tiempo y se
   documenta atribucion + limites.
3. No acoplar el CTA 3D ni la ruta stub (#78) a la existencia de DEM.

La decision vinculante va en `#77` (`docs/adr-dem.md`).
