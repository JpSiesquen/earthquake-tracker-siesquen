# Modelo de estilo de MapLibre

El sandbox de `sandbox/maplibre/` mantiene una integración mínima de MapLibre independiente de la
aplicación React. Su configuración usa el Style JSON Liberty de OpenFreeMap y añade un catálogo
GeoJSON local sobre ese basemap.

## Style document

El constructor recibe la URL del Style JSON mediante la propiedad `style`:

```js
const BASEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const map = new maplibregl.Map({
  container: 'map',
  style: BASEMAP_STYLE_URL,
  center: INITIAL_CENTER,
  zoom: INITIAL_ZOOM,
});
```

El documento de estilo declara las fuentes del basemap y el orden de sus capas. Los recursos propios
se registran después del evento `load`, cuando ese documento ya está disponible.

## Source

Un source incorpora datos al mapa sin definir su representación. El sandbox registra un
`FeatureCollection` como fuente GeoJSON:

```js
map.addSource(EARTHQUAKE_SOURCE_ID, {
  type: 'geojson',
  data: earthquakeData,
});
```

Las geometrías y propiedades permanecen centralizadas en el source. Distintos layers pueden
consultar el mismo catálogo sin duplicarlo.

## Layer

Un layer selecciona un source y establece cómo participa en el render. El layer base representa
cada geometría Point como un círculo:

```js
map.addLayer({
  id: EARTHQUAKE_LAYER_ID,
  type: 'circle',
  source: EARTHQUAKE_SOURCE_ID,
  paint: {
    'circle-color': '#e11d48',
    'circle-radius': 8,
  },
});
```

El layer de eventos significativos reutiliza el mismo source y restringe sus features mediante una
expresión de filtro:

```js
filter: ['>=', ['get', 'mag'], SIGNIFICANT_MAGNITUDE],
```

Los layers se procesan en el orden en que se añaden. El layer filtrado se registra después del base
para que su codificación visual quede superpuesta.

## Paint y layout

`paint` controla propiedades visuales como color y radio. Puede recibir valores constantes o
expresiones evaluadas contra las propiedades de cada feature.

`layout` controla la participación estructural del layer. El sandbox modifica
`layout.visibility` con `setLayoutProperty` para ocultar o restaurar ambos layers sin eliminar el
source ni reconstruir el mapa.

Esta separación permite actualizar datos, representación y visibilidad de forma independiente.
