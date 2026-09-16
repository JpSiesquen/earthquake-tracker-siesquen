import { Link } from 'react-router-dom'

import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import './Open3DCta.css'

/**
 * CTA 2D → 3D: navega al layout dedicado `/event/:id/3d`.
 * En móvil: usable, con aviso de lectura preferente en desktop (#110).
 */
export function Open3DCta() {
  const selectedId = useEarthquakeSelection((state) => state.selectedId)

  if (selectedId === null) return null

  return (
    <section className="open-3d-cta" aria-labelledby="open-3d-cta-title">
      <h2 id="open-3d-cta-title">Profundidad 3D</h2>
      <p>
        Abre el espacio de análisis local para leer la profundidad del evento.
      </p>
      <p className="open-3d-cta__narrow-hint">
        En pantallas pequeñas la escena 3D se lee mejor en desktop.
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
