import type { EarthquakeSummary } from '../../shared/earthquake.ts'
import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import './EarthquakeList.css'

const timeFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

type EarthquakeListProps = {
  earthquakes: readonly EarthquakeSummary[]
}

function formatMagnitude(magnitude: number | null): string {
  return magnitude === null ? '-' : magnitude.toFixed(1)
}

function formatPlace(place: string | null): string {
  return place?.trim() ? place : 'Ubicación sin dato'
}

function formatTimeUtc(timeMs: number): string {
  return `${timeFormatter.format(new Date(timeMs))} UTC`
}

/**
 * Lista operable del catalogo filtrado (misma vista que el mapa).
 * La sincronizacion flyTo / scroll queda en #58.
 */
export function EarthquakeList({ earthquakes }: EarthquakeListProps) {
  const selectedId = useEarthquakeSelection((state) => state.selectedId)
  const select = useEarthquakeSelection((state) => state.select)

  return (
    <section
      className="earthquake-list"
      aria-labelledby="earthquake-list-title"
    >
      <div className="earthquake-list__header">
        <h2 id="earthquake-list-title">Eventos</h2>
        <p className="earthquake-list__count" aria-live="polite">
          {earthquakes.length} en vista
        </p>
      </div>

      {earthquakes.length === 0 ? (
        <p className="earthquake-list__empty" role="status">
          Ningun evento con los filtros actuales.
        </p>
      ) : (
        <ul className="earthquake-list__items">
          {earthquakes.map((earthquake) => {
            const isSelected = earthquake.id === selectedId

            return (
              <li key={earthquake.id}>
                <button
                  type="button"
                  className={
                    isSelected
                      ? 'earthquake-list__item earthquake-list__item--selected'
                      : 'earthquake-list__item'
                  }
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => select(earthquake.id)}
                >
                  <span className="earthquake-list__mag">
                    M {formatMagnitude(earthquake.magnitude)}
                  </span>
                  <span className="earthquake-list__place">
                    {formatPlace(earthquake.place)}
                  </span>
                  <span className="earthquake-list__time">
                    {formatTimeUtc(earthquake.timeMs)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
