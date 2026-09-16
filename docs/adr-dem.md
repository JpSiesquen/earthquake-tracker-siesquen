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

## Nota

Si en una iteracion posterior se anade DEM, debe ser un PR optativo con
atribucion explicita y degradacion a plano si el fetch falla — nunca como
requisito del deep link 3D.
