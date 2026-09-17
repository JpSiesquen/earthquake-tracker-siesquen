import { useEffect, useRef } from 'react'

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
  /** Total del catálogo antes de filtros de vista */
  catalogTotal: number | null
  isCatalogLoading: boolean
  isCatalogStale: boolean
  catalogError: string | null
  hasActiveFilters: boolean
  onSelectEarthquake: (earthquake: EarthquakeSummary) => void
}

function formatMagnitude(magnitude: number | null): string {
  return magnitude === null ? '-' : magnitude.toFixed(1)
}

function formatPlace(place: string | null): string {
  return place?.trim() ? place : 'Ubicacion sin dato'
}

function formatTimeUtc(timeMs: number): string {
  return `${timeFormatter.format(new Date(timeMs))} UTC`
}

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function emptyMessage({
  catalogError,
  isCatalogLoading,
  catalogTotal,
  hasActiveFilters,
}: {
  catalogError: string | null
  isCatalogLoading: boolean
  catalogTotal: number | null
  hasActiveFilters: boolean
}): { tone: 'error' | 'status'; text: string } {
  if (catalogError && catalogTotal === null) {
    return {
      tone: 'error',
      text: `Error de catálogo: ${catalogError}`,
    }
  }

  if (isCatalogLoading && catalogTotal === null) {
    return { tone: 'status', text: 'Cargando eventos…' }
  }

  if (catalogTotal === 0) {
    return {
      tone: 'status',
      text: 'Sin eventos en esta ventana del catálogo.',
    }
  }

  if (hasActiveFilters) {
    return {
      tone: 'status',
      text: 'Ningún evento con los filtros actuales.',
    }
  }

  return { tone: 'status', text: 'Sin eventos visibles.' }
}

/**
 * Lista operable del catalogo filtrado (misma vista que el mapa).
 * Seleccion compartida con el mapa via Zustand + callbacks de sync.
 */
export function EarthquakeList({
  earthquakes,
  catalogTotal,
  isCatalogLoading,
  isCatalogStale,
  catalogError,
  hasActiveFilters,
  onSelectEarthquake,
}: EarthquakeListProps) {
  const selectedId = useEarthquakeSelection((state) => state.selectedId)
  const itemsRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    if (selectedId === null || !itemsRef.current) return

    const item = itemsRef.current.querySelector(
      `[data-earthquake-id="${CSS.escape(selectedId)}"]`,
    )
    if (!(item instanceof HTMLElement)) return

    item.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [selectedId])

  const empty = emptyMessage({
    catalogError,
    isCatalogLoading,
    catalogTotal,
    hasActiveFilters,
  })

  return (
    <section
      className="earthquake-list"
      aria-labelledby="earthquake-list-title"
      aria-busy={isCatalogLoading && catalogTotal === null}
    >
      <div className="earthquake-list__header">
        <h2 id="earthquake-list-title">Eventos</h2>
        <p className="earthquake-list__count" aria-live="polite">
          {earthquakes.length} en vista
          {isCatalogStale ? (
            <span className="earthquake-list__stale"> · stale</span>
          ) : null}
        </p>
      </div>

      {earthquakes.length === 0 ? (
        <p
          className={
            empty.tone === 'error'
              ? 'earthquake-list__empty earthquake-list__empty--error'
              : 'earthquake-list__empty'
          }
          role={empty.tone === 'error' ? 'alert' : 'status'}
        >
          {empty.text}
        </p>
      ) : (
        <ul className="earthquake-list__items" ref={itemsRef}>
          {earthquakes.map((earthquake) => {
            const isSelected = earthquake.id === selectedId

            return (
              <li key={earthquake.id} data-earthquake-id={earthquake.id}>
                <button
                  type="button"
                  className={
                    isSelected
                      ? 'earthquake-list__item earthquake-list__item--selected'
                      : 'earthquake-list__item'
                  }
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelectEarthquake(earthquake)}
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
