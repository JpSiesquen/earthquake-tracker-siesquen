# Earthquake Tracker

Visualizacion sismica **2D → 3D**: mapa operativo con capas y, al seleccionar un
evento, escena local con profundidad (hipocentro).

No es un globo generico con puntos. El foco es entender un evento: ubicacion,
magnitud y profundidad, con datos USGS atraves de un BFF propio.

## Stack

- Vite, React 19, TypeScript, React Router
- MapLibre 6 (mapa 2D de producto), Zustand (seleccion UI)
- React Three Fiber (escena 3D: Fase 5; hay ruta stub `/event/:id/3d`)
- BFF serverless (catalogo, detail, search FDSN), Zod, TanStack Query
- oxlint, Prettier, Husky, GitHub Actions (`verificar`)
- Vercel

## Demo

https://earthquake-tracker-siesquen.vercel.app

## Estado del proyecto

**Capa 1 usable** + **Fase 4 cerrada:** ficha con detail USGS, chips de products
(disponibilidad), vecinos via FDSN en BFF, CTA «Abrir 3D» a stub de ruta, ADR de
suelo = plano honesto.

**Falta:** escena R3F real (Fase 5), capas de productos en mapa (Fase 6), media
README (Fase 7).

## Desarrollo

```bash
npm ci
npm run hooks
npm run dev
```

Usa `npm ci` (no `npm install` para clonar). Luego `npm run hooks`: el repo
tiene `ignore-scripts=true` en `.npmrc`, asi que Husky no se activa solo.

Eso es deliberado. Bloquea scripts de paquetes en install (vector de worms npm
como Shai-Hulud, 2025: robo de tokens y repos en GitHub). Detalle en
[`CONTRIBUTING.md`](./CONTRIBUTING.md#seguridad-de-dependencias).

Sandbox MapLibre (Fase 0):

```bash
python -m http.server 4173
```

Abrir `http://localhost:4173/sandbox/maplibre/`.

Mas detalle: [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`PRODUCT.md`](./PRODUCT.md),
[`AGENTS.md`](./AGENTS.md).
