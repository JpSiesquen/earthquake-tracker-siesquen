import { Link } from 'react-router-dom'

import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import './Open3DCta.css'

/**
 * CTA 2D → 3D: navega a la ruta stub `/event/:id/3d`.
 * La escena R3F llega en Fase 5; aqui solo hay navegacion honesta.
 */
export function Open3DCta() {
  const selectedId = useEarthquakeSelection((state) => state.selectedId)

  if (selectedId === null) return null

  return (
    <section className="open-3d-cta" aria-labelledby="open-3d-cta-title">
      <h2 id="open-3d-cta-title">Profundidad 3D</h2>
      <p>
        Abre la ruta de la escena local. Por ahora es un stub de laboratorio
        (sin Three.js).
      </p>
      <Link
        className="open-3d-cta__action"
        to={`/event/${encodeURIComponent(selectedId)}/3d`}
      >
        Abrir 3D
      </Link>
    </section>
  )
}
