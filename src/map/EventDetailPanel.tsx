import { useEffect, useRef } from 'react'

import { useEarthquakeDetail } from '../api/useEarthquakeDetail.ts'
import { useShakeMapContours } from '../api/useShakeMapContours.ts'
import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import { ShakeMapContourStatus } from './ShakeMapContourStatus.tsx'
import { deriveShakeMapContourUiState } from './shakeMapContourStatus.ts'

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

type PagerAlertLevel = 'green' | 'yellow' | 'orange' | 'red'

function parsePagerAlert(
  raw: string | null | undefined,
): PagerAlertLevel | null {
  if (!raw) return null
  const level = raw.trim().toLowerCase()
  if (
    level === 'green' ||
    level === 'yellow' ||
    level === 'orange' ||
    level === 'red'
  ) {
    return level
  }
  return null
}

function formatPagerAlertLabel(level: PagerAlertLevel): string {
  switch (level) {
    case 'green':
      return 'alerta verde'
    case 'yellow':
      return 'alerta amarilla'
    case 'orange':
      return 'alerta naranja'
    case 'red':
      return 'alerta roja'
  }
}

function formatDyfiFelt(felt: number): string {
  return Number.isInteger(felt) ? String(felt) : felt.toFixed(0)
}

function formatDyfiCdi(cdi: number): string {
  return Number.isInteger(cdi) ? String(cdi) : cdi.toFixed(1)
}

/**
 * Ficha de evento: mag, profundidad, lugar, hora y link USGS.
 * Instrumento de panel; no card de marketing.
 */
export function EventDetailPanel() {
  const panelRef = useRef<HTMLElement | null>(null)
  const selectedId = useEarthquakeSelection((state) => state.selectedId)
  const { data, error, isLoading } = useEarthquakeDetail(selectedId)

  const contourMiUrl = data?.products.shakemap.contourMiUrl
  const contoursQuery = useShakeMapContours(selectedId, contourMiUrl)

  useEffect(() => {
    if (selectedId === null) return
    const reduceMotion = globalThis.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    panelRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [selectedId])

  if (selectedId === null) return null

  const earthquake = data?.earthquake
  const usgsUrl = data?.usgsUrl
  const products = data?.products
  const availableProducts: string[] = []
  if (products?.shakemap.available) availableProducts.push('ShakeMap')
  if (products?.pager.available) availableProducts.push('PAGER')
  if (products?.dyfi.available) availableProducts.push('DYFI')

  const contourState = deriveShakeMapContourUiState(
    products?.shakemap,
    products?.shakemap.contourMiUrl
      ? {
          isPending: contoursQuery.isPending,
          isFetching: contoursQuery.isFetching,
          isError: contoursQuery.isError,
          error: contoursQuery.error,
          data: contoursQuery.data,
        }
      : null,
  )
  const pagerAlert = parsePagerAlert(products?.pager.alert)
  const dyfiFelt = products?.dyfi.felt ?? null
  const dyfiCdi = products?.dyfi.cdi ?? null
  const hasDyfiMetrics = dyfiFelt !== null || dyfiCdi !== null
  const hasProductDetails =
    pagerAlert !== null || hasDyfiMetrics || contourState !== null
  const showAvailabilityNote =
    availableProducts.length > 0 && !hasProductDetails

  return (
    <section
      ref={panelRef}
      className="event-detail-panel"
      aria-labelledby="event-detail-panel-title"
      aria-busy={isLoading && !data}
    >
      <h2 id="event-detail-panel-title">Ficha</h2>

      {isLoading && !data ? (
        <p className="event-detail-panel__status" role="status">
          Cargando detalle…
        </p>
      ) : null}

      {error && !data ? (
        <p className="event-detail-panel__error" role="alert">
          {error.message}
        </p>
      ) : null}

      {error && data ? (
        <p className="event-detail-panel__stale" role="status">
          No se pudo refrescar; se muestra el último detalle válido.
        </p>
      ) : null}

      {earthquake ? (
        <>
          <dl className="event-detail-panel__primary">
            <div className="event-detail-panel__magnitude">
              <dt>Magnitud</dt>
              <dd>M {formatMagnitude(earthquake.magnitude)}</dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>{formatPlace(earthquake.place)}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>{formatTimeUtc(earthquake.timeMs)}</dd>
            </div>
          </dl>
          <dl className="event-detail-panel__secondary">
            <div>
              <dt>Profundidad</dt>
              <dd>{formatDepth(earthquake.depthKm)}</dd>
            </div>
            <div>
              <dt>Id</dt>
              <dd>
                <code>{earthquake.id}</code>
              </dd>
            </div>
          </dl>
        </>
      ) : null}

      {products ? (
        <div className="event-detail-panel__products">
          <p className="event-detail-panel__products-label">Products USGS</p>
          {availableProducts.length > 0 ? (
            <p
              className="event-detail-panel__availability"
              aria-label="Products disponibles"
            >
              {availableProducts.join(' · ')}
            </p>
          ) : (
            <p className="event-detail-panel__products-empty">
              Sin productos USGS (ShakeMap, PAGER, DYFI) en este evento.
            </p>
          )}
          {showAvailabilityNote ? (
            <p className="event-detail-panel__products-note">
              Disponibles en USGS; no equivalen a capa en el mapa.
            </p>
          ) : null}
          {pagerAlert ? (
            <p
              className={`event-detail-panel__pager event-detail-panel__pager--${pagerAlert}`}
              role="status"
            >
              <span className="event-detail-panel__pager-label">PAGER</span>
              <span className="event-detail-panel__pager-value">
                {formatPagerAlertLabel(pagerAlert)}
              </span>
              <span className="event-detail-panel__pager-note">
                Impacto USGS; no es un cálculo de esta app.
              </span>
            </p>
          ) : null}
          {hasDyfiMetrics ? (
            <dl className="event-detail-panel__dyfi" aria-label="DYFI">
              {dyfiFelt !== null ? (
                <div>
                  <dt>Reportes sentidos</dt>
                  <dd>{formatDyfiFelt(dyfiFelt)}</dd>
                </div>
              ) : null}
              {dyfiCdi !== null ? (
                <div>
                  <dt>CDI</dt>
                  <dd>
                    {formatDyfiCdi(dyfiCdi)}
                    <span className="event-detail-panel__dyfi-hint">
                      {' '}
                      (intensidad comunitaria)
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {contourState ? (
            <ShakeMapContourStatus
              state={contourState}
              onRetry={
                contourState.kind === 'error'
                  ? () => {
                      void contoursQuery.refetch()
                    }
                  : undefined
              }
            />
          ) : null}
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
