import { useState } from 'react'

import type { CatalogWindow } from '../shared/window.ts'

import { useEarthquakes } from './api/useEarthquakes.ts'
import { MapView } from './map/MapView.tsx'
import './App.css'

function App() {
  const [window, setWindow] = useState<CatalogWindow>('day')
  const { data, error, isLoading, isFetching } = useEarthquakes(window)

  return (
    <main className="app">
      <h1>Earthquake Tracker</h1>
      <p>
        Fase 3: mapa de producto con basemap OpenFreeMap. Capas de sismos en
        issues siguientes.
      </p>

      <MapView />

      <div className="toolbar">
        <label>
          Ventana{' '}
          <select
            value={window}
            onChange={(e) => setWindow(e.target.value as CatalogWindow)}
          >
            <option value="day">day</option>
            <option value="week">week</option>
          </select>
        </label>
      </div>

      {isLoading ? <p>Cargando catalogo...</p> : null}
      {error ? (
        <p className="error" role="alert">
          Error: {error.message}
        </p>
      ) : null}

      {data ? (
        <section className="catalog" aria-live="polite">
          <p>
            <strong>{data.count}</strong> eventos ({data.window})
            {data.stale ? ' · stale' : ''}
            {isFetching && !isLoading ? ' · actualizando...' : ''}
          </p>
          <p className="meta">
            fetchedAt {new Date(data.fetchedAt).toISOString()}
          </p>
          <pre className="json">
            {JSON.stringify(data.earthquakes.slice(0, 5), null, 2)}
            {data.earthquakes.length > 5
              ? `\n... +${data.earthquakes.length - 5} mas`
              : ''}
          </pre>
        </section>
      ) : null}
    </main>
  )
}

export default App
