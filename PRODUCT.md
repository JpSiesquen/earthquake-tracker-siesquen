# Product

## Register

product

## Users

Visitantes tecnicos que abren la demo o el repositorio en una pasada corta (30-90 s):
reclutadores, hiring managers y desarrolladores que evaluan oficio, no solo "si funciona".

## Product Purpose

Visualizacion sismica 2D/3D: catalogo USGS via BFF con validacion y cache, mapa operativo
multicapa y escena local con profundidad (hipocentro) al seleccionar un evento.

Tesis: del mapa 2D al volumen tectonico. Exito: se entiende en segundos que no es otro
globo con puntos, y que hay frontera de datos e ingenieria detras.

## Brand Personality

preciso · sobrio · de laboratorio · claro

Voz tecnica y directa. Estetica de mesa de monitoreo geologico (claros, neutrales), no
HUD espacial. El mapa y la profundidad del foco son protagonistas; los paneles informan
sin competir.

## Anti-references

- Globo oscuro generico "USGS dots" clonado de demos de portfolio tipicas
- Look del ISS Tracker (espacio, telemetria de mision, negro espacial)
- Dashboards Material UI / admin templates
- AI slop: morados, glow, pills, Inter por defecto, cards anidadas sin motivo
- Mezclar ISS y sismos en el mismo producto

## Design Principles

1. **2D opera, 3D explica.** El mapa situacion; la escena local, profundidad.
2. **Profundidad visible.** Epicentro vs hipocentro debe leerse sin manual.
3. **Datos con estados.** Loading, error y stale visibles; no fingir frescura eterna.
4. **Capas honestas.** CTA "Abrir 3D" sin escena falsa en Capa 1.
5. **Una decision, un sitio.** Tokens y tipografia de laboratorio; sin MUI.

## Accessibility & Inclusion

- Contraste legible en paneles
- `prefers-reduced-motion` respetado cuando haya motion
- Lista equivalente al mapa (teclado) en fases posteriores
- Desktop-first; movil aceptable al cierre
