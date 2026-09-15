export const DEFAULT_MIN_MAGNITUDE = -2
export const DEFAULT_MAX_DEPTH_KM = 750

type MapFiltersProps = {
  minMagnitude: number
  maxDepthKm: number
  visibleCount: number
  totalCount: number
  onMinMagnitudeChange: (value: number) => void
  onMaxDepthChange: (value: number) => void
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
  onMinMagnitudeChange,
  onMaxDepthChange,
  onReset,
}: MapFiltersProps) {
  const formattedMagnitude = minMagnitude.toFixed(1)
  const hasActiveFilters =
    minMagnitude !== DEFAULT_MIN_MAGNITUDE ||
    maxDepthKm !== DEFAULT_MAX_DEPTH_KM

  return (
    <section className="map-filters" aria-labelledby="map-filters-title">
      <div className="map-filters__header">
        <h2 id="map-filters-title">Filtros de vista</h2>
        <button type="button" disabled={!hasActiveFilters} onClick={onReset}>
          Limpiar filtros
        </button>
      </div>

      <div className="map-filters__controls">
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
