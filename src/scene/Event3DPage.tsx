import { lazy, Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useEarthquakeDetail } from '../api/useEarthquakeDetail.ts'
import { useEarthquakeNeighbors } from '../api/useEarthquakeNeighbors.ts'
import './Event3DPage.css'

const EVENT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/
const EventSceneCanvas = lazy(() => import('./EventSceneCanvas.tsx'))

function readEventId(value: string | undefined): string | null {
  const eventId = value?.trim()
  return eventId && EVENT_ID_PATTERN.test(eventId) ? eventId : null
}

function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])
}

function EventRouteError({ hasInvalidId }: { hasInvalidId: boolean }) {
  return (
    <main className="event-3d-page event-3d-page--error">
      <header className="event-3d-page__topbar">
        <Link className="event-3d-page__brand" to="/">
          Earthquake Tracker
        </Link>
        <span className="event-3d-page__layer">Capa 2</span>
      </header>

      <section
        className="event-3d-page__error-panel"
        aria-labelledby="route-error-title"
      >
        <p className="event-3d-page__eyebrow">Ruta no disponible</p>
        <h1 id="route-error-title">
          {hasInvalidId
            ? 'Identificador de evento inválido'
            : 'Falta el evento'}
        </h1>
        <p role="alert">
          {hasInvalidId
            ? 'El identificador de la URL no tiene un formato admitido.'
            : 'La escena 3D necesita un identificador de evento en la URL.'}
        </p>
        <Link className="event-3d-page__action" to="/">
          Volver al mapa y elegir un evento
        </Link>
      </section>
    </main>
  )
}

/**
 * Shell estable de Capa 2. La ruta y su jerarquia visual no dependen del
 * renderer 3D. El Canvas se carga solo en rutas validas de Capa 2.
 */
export function Event3DPage() {
  const { id } = useParams<{ id: string }>()
  const eventId = readEventId(id)
  const hasInvalidId = id !== undefined && id.trim().length > 0
  const detailQuery = useEarthquakeDetail(eventId)
  const neighborsQuery = useEarthquakeNeighbors(detailQuery.data)

  useDocumentTitle(
    eventId
      ? `Escena 3D · ${eventId} | Earthquake Tracker`
      : 'Ruta 3D no disponible | Earthquake Tracker',
  )

  if (eventId === null) {
    return <EventRouteError hasInvalidId={hasInvalidId} />
  }

  const backTo = `/?event=${encodeURIComponent(eventId)}`

  return (
    <main className="event-3d-page">
      <header className="event-3d-page__topbar">
        <Link className="event-3d-page__brand" to={backTo}>
          Earthquake Tracker
        </Link>
        <span className="event-3d-page__layer">Capa 2 · escena local</span>
      </header>

      <div className="event-3d-page__heading">
        <div>
          <p className="event-3d-page__eyebrow">Análisis de profundidad</p>
          <h1>Escena sísmica local</h1>
        </div>
        <p className="event-3d-page__event-id">
          Evento <code>{eventId}</code>
        </p>
      </div>

      <div className="event-3d-page__workspace">
        <section
          className="event-3d-page__viewport"
          aria-labelledby="scene-placeholder-title"
        >
          <div className="event-3d-page__viewport-header">
            <div>
              <p className="event-3d-page__eyebrow">Volumen de referencia</p>
              <h2 id="scene-placeholder-title">Área de escena 3D</h2>
            </div>
            <span className="event-3d-page__status">Canvas base</span>
          </div>

          <Suspense
            fallback={
              <div className="event-3d-page__canvas-loading" role="status">
                Inicializando viewport 3D…
              </div>
            }
          >
            <EventSceneCanvas
              depthKm={detailQuery.data?.earthquake.depthKm ?? null}
              focusId={eventId}
              focusCoordinates={
                detailQuery.data?.earthquake.coordinates ?? null
              }
              neighbors={neighborsQuery.data?.earthquakes ?? []}
            />
          </Suspense>
        </section>

        <aside
          className="event-3d-page__context"
          aria-label="Contexto de la escena"
        >
          <section>
            <p className="event-3d-page__eyebrow">Lectura prevista</p>
            <h2>Del mapa al volumen</h2>
            <p>
              La escena explicará la profundidad del foco respecto de la
              superficie y su relación con sismos cercanos.
            </p>
          </section>

          <section>
            <p className="event-3d-page__eyebrow">Referencia espacial</p>
            <h2>Plano honesto</h2>
            <p>
              La superficie será un plano de referencia, no una representación
              de topografía real.
            </p>
          </section>

          <Link className="event-3d-page__action" to={backTo}>
            Volver al evento en el mapa
          </Link>
        </aside>
      </div>
    </main>
  )
}
