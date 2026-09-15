# MapLibre XSS (GHSA-jrc7-96c5-q579)

Registro de seguridad del proyecto. No es un tutorial de MapLibre.

## Advisory

| Campo | Valor |
| --- | --- |
| ID | [GHSA-jrc7-96c5-q579](https://github.com/maplibre/maplibre-gl-js/security/advisories/GHSA-jrc7-96c5-q579) |
| CVE | CVE-2026-85061 |
| Severidad | Critical (CVSS 10.0 reportado en el advisory) |
| Paquete | `maplibre-gl` (npm) |
| Afectadas | `<= 6.4.0` |
| Parcheadas | `>= 6.4.1` |

### Mecanismo

`DOM.sanitize()` iteraba `elem.attributes` (un `NamedNodeMap` vivo) mientras hacia
`removeAttribute()`. Al borrar un atributo, el siguiente se desplaza y el bucle lo
salta. Un payload con atributos peligrosos consecutivos puede dejar uno vivo y
ejecutarse al insertar HTML en el control de atribucion (XSS zero-click).

Impacto tipico: styles o atribuciones de terceros no confiables / comprometidas.

## Alcance en este repo

El mapa de producto carga un style remoto (OpenFreeMap Liberty). La atribucion del
style pasa por el sanitizador de MapLibre.

| Superficie | Canal | Estado |
| --- | --- | --- |
| App Vite / Vercel (`dist`) | npm `maplibre-gl` | Remediado en **6.9.1** |
| Sandbox Fase 0 | CDN unpkg en `sandbox/maplibre/` | Remediado en **6.9.1** |

## Remediacion (historial)

1. **#157** / PR **#158** - producto: bump `5.12.0` -> `6.9.1`, migracion ESM/WebGL2,
   worker Vite explicito (`setWorkerUrl`).
2. Auditoria posterior: sandbox seguia en CDN `5.12.0` (fuera de `dist`, pero en el
   repo e instrucciones de arranque).
3. **#160** / PR **#161** - sandbox alineado a `6.9.1`.

Politica vigente: producto y sandbox en la **misma** version exacta parcheada cuando
sea posible; nunca `<= 6.4.0`.

## Verificacion rapida

```bash
node -e "console.log(require('./package.json').dependencies['maplibre-gl'])"
npm audit
rg "maplibre-gl@" sandbox/maplibre/
```

Esperado: version `>= 6.4.1` (hoy `6.9.1`) en npm y en el HTML del sandbox; audit sin
hallazgos conocidos para este advisory.

## Referencias

- Guia migracion 5 -> 6: https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/
- Modelo de estilo (sandbox): [`docs/00-maplibre-basico.md`](./00-maplibre-basico.md)
