import { useState } from 'react'

import type { CatalogWindow } from '../shared/window.ts'

import { useEarthquakes } from './api/useEarthquakes.ts'
import { MapView } from './map/MapView.tsx'
import './App.css'

function App() {
  const [window, setWindow] = useState<CatalogWindow>('day')
  const { data, error, isLoading, isFetching } = useEarthquakes(window)
  const currentCatalog = data?.window === window ? data : undefined

  return (
    <main className="app">
      <h1>Earthquake Tracker</h1>
      <p>
        Fase 3: mapa de producto con basemap OpenFreeMap. Capas de sismos en
        issues siguientes.
      </p>

      <MapView
        earthquakes={currentCatalog?.earthquakes}
        window={window}
        isCatalogLoading={isLoading}
        isCatalogFetching={isFetching}
        isCatalogStale={currentCatalog?.stale ?? false}
        catalogError={error?.message ?? null}
        onWindowChange={setWindow}
      />

      {currentCatalog ? (
        <section className="catalog" aria-live="polite">
          <p>
            <strong>{currentCatalog.count}</strong> eventos (
            {currentCatalog.window}){currentCatalog.stale ? ' · stale' : ''}
            {isFetching && !isLoading ? ' · actualizando...' : ''}
          </p>
          <p className="meta">
            fetchedAt {new Date(currentCatalog.fetchedAt).toISOString()}
          </p>
          <pre className="json">
            {JSON.stringify(currentCatalog.earthquakes.slice(0, 5), null, 2)}
            {currentCatalog.earthquakes.length > 5
              ? `\n... +${currentCatalog.earthquakes.length - 5} mas`
              : ''}
          </pre>
        </section>
      ) : null}
    </main>
  )
}

export default App
