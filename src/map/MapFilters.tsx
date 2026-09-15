import { isCatalogWindow, type CatalogWindow } from '../../shared/window.ts'

export const DEFAULT_MIN_MAGNITUDE = -2
export const DEFAULT_MAX_DEPTH_KM = 750

type MapFiltersProps = {
  minMagnitude: number
  maxDepthKm: number
  visibleCount: number
  totalCount: number
  window: CatalogWindow
  isCatalogLoading: boolean
  isCatalogFetching: boolean
  isCatalogStale: boolean
  catalogError: string | null
  onMinMagnitudeChange: (value: number) => void
  onMaxDepthChange: (value: number) => void
  onWindowChange: (window: CatalogWindow) => void
  onReset: () => void
}

const MAX_MAGNITUDE = 8
const MAGNITUDE_STEP = 0.5
const MIN_MAX_DEPTH_KM = 0
const DEPTH_STEP_KM = 25

export function MapFilters({
  minMagnitude,
  maxDepthKm,
  visibleCount,
  totalCount,
  window,
  isCatalogLoading,
  isCatalogFetching,
  isCatalogStale,
  catalogError,
  onMinMagnitudeChange,
  onMaxDepthChange,
  onWindowChange,
  onReset,
}: MapFiltersProps) {
  const formattedMagnitude = minMagnitude.toFixed(1)
  const hasActiveFilters =
    minMagnitude !== DEFAULT_MIN_MAGNITUDE ||
    maxDepthKm !== DEFAULT_MAX_DEPTH_KM
  const catalogStatus = catalogError
    ? `Error al cargar: ${catalogError}`
    : isCatalogLoading
      ? 'Cargando catálogo…'
      : isCatalogStale
        ? 'Datos de respaldo (stale)'
        : isCatalogFetching
          ? 'Actualizando catálogo…'
          : 'Catálogo actualizado'

  return (
    <section className="map-filters" aria-labelledby="map-filters-title">
      <div className="map-filters__header">
        <h2 id="map-filters-title">Filtros de vista</h2>
        <button type="button" disabled={!hasActiveFilters} onClick={onReset}>
          Limpiar filtros
        </button>
      </div>

      <div className="map-filters__controls">
        <div className="map-filter map-filter--window">
          <label htmlFor="catalog-window">Ventana del catálogo</label>
          <select
            id="catalog-window"
            value={window}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(event) => {
              if (isCatalogWindow(event.target.value)) {
                onWindowChange(event.target.value)
              }
            }}
          >
            <option value="day">Últimas 24 horas</option>
            <option value="week">Últimos 7 días</option>
          </select>
          <p
            className="map-filter__status"
            data-status={catalogError ? 'error' : 'ok'}
            role={catalogError ? 'alert' : 'status'}
          >
            {catalogStatus}
          </p>
        </div>

        <div className="map-filter">
          <div className="map-filter__heading">
            <label htmlFor="min-magnitude">Magnitud mínima</label>
            <output htmlFor="min-magnitude">M ≥ {formattedMagnitude}</output>
          </div>
          <input
            id="min-magnitude"
            type="range"
            min={DEFAULT_MIN_MAGNITUDE}
            max={MAX_MAGNITUDE}
            step={MAGNITUDE_STEP}
            value={minMagnitude}
            aria-valuetext={`Magnitud ${formattedMagnitude} o superior`}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(event) =>
              onMinMagnitudeChange(event.target.valueAsNumber)
            }
          />
        </div>

        <div className="map-filter">
          <div className="map-filter__heading">
            <label htmlFor="max-depth">Profundidad máxima</label>
            <output htmlFor="max-depth">{maxDepthKm} km</output>
          </div>
          <input
            id="max-depth"
            type="range"
            min={MIN_MAX_DEPTH_KM}
            max={DEFAULT_MAX_DEPTH_KM}
            step={DEPTH_STEP_KM}
            value={maxDepthKm}
            aria-valuetext={`Profundidad máxima ${maxDepthKm} kilómetros`}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(event) => onMaxDepthChange(event.target.valueAsNumber)}
          />
        </div>
      </div>

      <div className="map-filters__meta" aria-live="polite">
        <span>
          <strong>{visibleCount}</strong> visibles de {totalCount}
        </span>
        <span>Sin magnitud o profundidad conocida se excluyen</span>
      </div>
    </section>
  )
}
