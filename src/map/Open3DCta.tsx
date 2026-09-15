import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import './Open3DCta.css'

/**
 * CTA honesto: enuncia la tesis 2D -> 3D sin montar escena falsa.
 * La navegacion real llega en Fase 4 (#78) / Fase 5.
 */
export function Open3DCta() {
  const selectedId = useEarthquakeSelection((state) => state.selectedId)

  if (selectedId === null) return null

  return (
    <section className="open-3d-cta" aria-labelledby="open-3d-cta-title">
      <h2 id="open-3d-cta-title">Profundidad 3D</h2>
      <p>
        La escena local con hipocentro es la siguiente capa. Aun no esta
        disponible en esta entrega.
      </p>
      <button type="button" disabled title="Disponible en una fase posterior">
        Abrir 3D
      </button>
    </section>
  )
}
