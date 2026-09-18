# ADR: DEM o plano honesto (Capa 2)

- **Estado:** Aceptado
- **Fecha:** 2026-09-15
- **Issue:** #77
- **Contexto previo:** [`docs/dem-spike.md`](./dem-spike.md) (#76)
- **Resolucion de implementacion:** #88 cerrada como N/A; #87 materializa el
  plano honesto sin dependencia DEM.

## Contexto

La escena 3D (Fase 5 / Capa 2) debe mostrar un evento local con **profundidad**
(epicentro → hipocentro) y vecinos. Surge la pregunta: ¿hace falta relieve DEM
bajo el evento, o basta un plano?

La tesis del producto es **2D operativo → 3D de profundidad**, no “globo con
terreno fotorealista”.

## Decision

**Usar un plano honesto como suelo de Capa 2.**

- Mesh plana en Y ≈ 0 (laboratorio).
- Hipocentro en Y negativo (o convencion documentada en `docs/escena-3d.md` cuando exista).
- Rotular en UI que el suelo es un plano de referencia, no topografia real.
- DEM free (p. ej. Terrarium) queda **fuera del camino critico**; solo si sobra
  tiempo despues de la escena minima.

### Convencion vertical

- Las coordenadas locales se expresan en kilometros en los tres ejes.
- Una profundidad sismica positiva se representa sobre **Y negativo**.
- La escena usa una exageracion vertical moderada de **1.5x** para hacer legible
  la profundidad sin presentarla como escala 1:1.
- Una profundidad desconocida no se dibuja: no se sustituye por Y=0, porque eso
  afirmaria incorrectamente que el evento esta en la superficie.

## Consecuencias

| Area | Efecto |
| --- | --- |
| Fase 5 | Priorizar camara, epicentro/hipocentro, vecinos, overlay; no bloquear por DEM |
| Issue de mesh DEM | #88 queda **N/A / diferida**; no bloquea el cierre de Capa 2 |
| CTA / ruta 3D (#78) | Puede navegar a stub sin esperar tiles de elevacion |
| Riesgo demo | Baja: cero dependencia de CDN de elevacion en el happy path |

## Alternativas descartadas (por ahora)

1. **Terrarium / tiles free en el cliente** — viable tecnicamente, pero anade
   decode RGB, atricion de host y atricion visual sin mejorar la tesis de profundidad.
2. **Open Topo Data publico para malla densa** — rate limit; no encaja.
3. **Copernicus / pipeline offline** — dato free, proceso caro; fuera de alcance.

## Criterios que pesan

1. Complejidad de integracion en R3F bajo el flujo issue→PR.
2. Licencia / atribucion / fiabilidad de terceros.
3. Impacto real en la historia que contamos (profundidad > relieve).

## Nota (historica)

La nota original dejaba DEM para una iteracion posterior. Fase 9 (#265) lo
formaliza abajo sin invalidar el plano como default.

## Addendum Fase 9: DEM opcional (#265)

- **Estado del addendum:** Aceptado
- **Fecha:** 2026-09-18
- **Issue:** #265 (implementacion de mesh: #273)

### Decision adicional

El **plano honesto sigue siendo el default** y el unico suelo garantizado en el
deep link `/event/:id/3d`.

DEM (relieve local) queda **optativo** en Fase 9:

- Se puede anadir un mesh de elevacion bajo el bbox del evento si el fetch y el
  decode funcionan.
- Formato de referencia: Terrarium / tiles free descritos en
  [`dem-spike.md`](./dem-spike.md). El spike documenta el formato; **no** fija
  un host concreto ni un compromiso de disponibilidad.
- Si el fetch falla (timeout, 4xx/5xx, decode, CORS, host caido), la escena
  **degrada al plano honesto** sin romper hipocentro, vecinos ni deep link.
- DEM **no** es requisito del deep link 3D: la ruta debe renderizar utiles con
  plano aunque el CDN de elevacion no responda.
- Atribucion de la fuente DEM visible en UI o en docs de escena cuando el relieve
  este activo.

### Orden de implementacion

1. Este addendum y AGENTS (#265) — solo docs.
2. Presencia de escena (intro, escala, jerarquia) puede ir en paralelo.
3. Mesh DEM (#273) solo despues de este addendum; siempre con fallback a plano.

### Consecuencias del addendum

| Area | Efecto |
| --- | --- |
| Deep link 3D | Nunca depende de elevacion para existir |
| Demo / portfolio | Relieve es bonus; fallo DEM no es fallo de producto |
| Licencia | Cualquier host elegido debe ir con atribucion explicita |
