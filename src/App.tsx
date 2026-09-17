import { useState } from 'react'

import type { CatalogWindow } from '../shared/window.ts'

import { useEarthquakes } from './api/useEarthquakes.ts'
import { MapView } from './map/MapView.tsx'
import './App.css'

function App() {
  const [window, setWindow] = useState<CatalogWindow>('week')
  const { data, error, isLoading, isFetching } = useEarthquakes(window)
  const currentCatalog = data?.window === window ? data : undefined

  return (
    <main className="app">
      <h1>Earthquake Tracker</h1>
      <p>
        Mapa de producto: capas, filtros y lista del catalogo filtrado (Capa 1).
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
    </main>
  )
}

export default App
