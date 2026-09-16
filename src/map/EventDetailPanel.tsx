import { useEarthquakeDetail } from '../api/useEarthquakeDetail.ts'
import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import './EventDetailPanel.css'

const timeFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

function formatMagnitude(magnitude: number | null): string {
  return magnitude === null ? '—' : magnitude.toFixed(1)
}

function formatDepth(depthKm: number | null): string {
  return depthKm === null ? 'Sin dato' : `${depthKm.toFixed(1)} km`
}

function formatPlace(place: string | null): string {
  return place?.trim() ? place : 'Ubicacion sin dato'
}

function formatTimeUtc(timeMs: number): string {
  return `${timeFormatter.format(new Date(timeMs))} UTC`
}

/**
 * Ficha de evento: mag, profundidad, lugar, hora y link USGS.
 * Instrumento de panel; no card de marketing.
 */
export function EventDetailPanel() {
  const selectedId = useEarthquakeSelection((state) => state.selectedId)
  const { data, error, isLoading, isFetching } = useEarthquakeDetail(selectedId)

  if (selectedId === null) return null

  const earthquake = data?.earthquake
  const usgsUrl = data?.usgsUrl
  const products = data?.products
  const availableProducts = products
    ? (
        [
          products.shakemap ? 'ShakeMap' : null,
          products.pager ? 'PAGER' : null,
          products.dyfi ? 'DYFI' : null,
        ] as const
      ).filter((label): label is string => label !== null)
    : []

  return (
    <section
      className="event-detail-panel"
      aria-labelledby="event-detail-panel-title"
      aria-busy={isLoading || isFetching}
    >
      <h2 id="event-detail-panel-title">Ficha</h2>

      {isLoading && !data ? (
        <p className="event-detail-panel__status" role="status">
          Cargando detalle…
        </p>
      ) : null}

      {error ? (
        <p className="event-detail-panel__error" role="alert">
          {error.message}
        </p>
      ) : null}

      {earthquake ? (
        <dl className="event-detail-panel__fields">
          <div>
            <dt>Magnitud</dt>
            <dd>M {formatMagnitude(earthquake.magnitude)}</dd>
          </div>
          <div>
            <dt>Profundidad</dt>
            <dd>{formatDepth(earthquake.depthKm)}</dd>
          </div>
          <div>
            <dt>Lugar</dt>
            <dd>{formatPlace(earthquake.place)}</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd>{formatTimeUtc(earthquake.timeMs)}</dd>
          </div>
          <div>
            <dt>Id</dt>
            <dd>
              <code>{earthquake.id}</code>
            </dd>
          </div>
        </dl>
      ) : null}

      {products ? (
        <div className="event-detail-panel__products">
          <p className="event-detail-panel__products-label">Products USGS</p>
          {availableProducts.length > 0 ? (
            <ul
              className="event-detail-panel__chips"
              aria-label="Products disponibles"
            >
              {availableProducts.map((label) => (
                <li key={label}>
                  <span className="event-detail-panel__chip">{label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="event-detail-panel__products-empty">
              Sin ShakeMap / PAGER / DYFI en este evento.
            </p>
          )}
          <p className="event-detail-panel__products-note">
            Disponible en USGS; contornos aun no se descargan aqui.
          </p>
        </div>
      ) : null}

      {usgsUrl ? (
        <p className="event-detail-panel__link">
          <a href={usgsUrl} target="_blank" rel="noreferrer">
            Ver en USGS
          </a>
        </p>
      ) : null}

      {data?.stale ? (
        <p className="event-detail-panel__stale" role="status">
          Dato en cache (stale) tras fallo upstream.
        </p>
      ) : null}
    </section>
  )
}
