import { Link, useParams } from 'react-router-dom'

import './Event3DStubPage.css'

/**
 * Stub de ruta 3D (#78). Sin Three/R3F: solo navegacion y mensaje laboratorio.
 * La escena real es Fase 5 (#79+).
 */
export function Event3DStubPage() {
  const { id } = useParams<{ id: string }>()
  const eventId = id?.trim() || null
  const backTo = eventId ? `/?event=${encodeURIComponent(eventId)}` : '/'

  return (
    <main className="event-3d-stub">
      <p className="event-3d-stub__eyebrow">Capa 2 · stub</p>
      <h1>Escena 3D</h1>
      <p>
        Ruta lista para la escena local (hipocentro / vecinos). Aun no hay
        Three.js ni terreno: el suelo sera un plano honesto (ver ADR DEM).
      </p>
      {eventId ? (
        <p className="event-3d-stub__id">
          Evento: <code>{eventId}</code>
        </p>
      ) : (
        <p className="event-3d-stub__id" role="status">
          Falta el id en la URL.
        </p>
      )}
      <p>
        <Link to={backTo}>Volver al mapa</Link>
      </p>
    </main>
  )
}
