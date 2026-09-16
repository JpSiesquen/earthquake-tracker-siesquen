import { Link } from 'react-router-dom'

import './SceneOverlay.css'

type SceneOverlayProps = {
  eventId: string
  magnitude: number | null | undefined
  place: string | null | undefined
  backTo: string
}

function formatMagnitude(magnitude: number | null | undefined): string {
  return typeof magnitude === 'number' && Number.isFinite(magnitude)
    ? magnitude.toFixed(1)
    : '—'
}

function formatPlace(place: string | null | undefined): string {
  const trimmed = place?.trim()
  return trimmed ? trimmed : 'Ubicación sin dato'
}

/**
 * Overlay HTML sobre el viewport 3D. El contenedor no captura puntero; solo
 * la ficha y el CTA usan pointer-events para no bloquear OrbitControls.
 */
export function SceneOverlay({
  eventId,
  magnitude,
  place,
  backTo,
}: SceneOverlayProps) {
  return (
    <div className="scene-overlay" aria-label="Datos del evento en escena">
      <div className="scene-overlay__card">
        <p className="scene-overlay__eyebrow">Evento foco</p>
        <p className="scene-overlay__magnitude">
          M {formatMagnitude(magnitude)}
        </p>
        <p className="scene-overlay__place">{formatPlace(place)}</p>
        <p className="scene-overlay__id">
          <code>{eventId}</code>
        </p>
      </div>

      <Link className="scene-overlay__action" to={backTo}>
        Volver al mapa
      </Link>
    </div>
  )
}
