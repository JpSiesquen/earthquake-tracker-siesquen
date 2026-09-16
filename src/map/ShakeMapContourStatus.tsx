import type { ShakeMapContourUiState } from './shakeMapContourStatus.ts'

import './ShakeMapContourStatus.css'

type ShakeMapContourStatusProps = {
  state: ShakeMapContourUiState
  onRetry?: () => void
}

/**
 * Estados visibles de contornos MMI en la ficha.
 * Error local: no tumba el resto del panel ni el catálogo.
 */
export function ShakeMapContourStatus({
  state,
  onRetry,
}: ShakeMapContourStatusProps) {
  if (state.kind === 'absent') {
    return (
      <div className="shakemap-contour-status" role="status">
        <p className="shakemap-contour-status__title">Sin ShakeMap</p>
        <p className="shakemap-contour-status__message">
          USGS no publica ShakeMap para este evento.
        </p>
      </div>
    )
  }

  if (state.kind === 'absent_no_contours') {
    return (
      <div className="shakemap-contour-status" role="status">
        <p className="shakemap-contour-status__title">ShakeMap sin contornos</p>
        <p className="shakemap-contour-status__message">
          Hay producto ShakeMap, pero sin geometría MMI usable en el mapa.
        </p>
      </div>
    )
  }

  if (state.kind === 'loading') {
    return (
      <div
        className="shakemap-contour-status"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="shakemap-contour-status__title">
          Cargando contornos MMI…
        </p>
        <p className="shakemap-contour-status__message">
          Obteniendo geometría vía BFF.
        </p>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div
        className="shakemap-contour-status shakemap-contour-status--error"
        role="alert"
      >
        <p className="shakemap-contour-status__title">
          Contornos MMI no disponibles
        </p>
        <p className="shakemap-contour-status__message">
          {state.message ?? 'No se pudieron cargar los contornos.'}
        </p>
        {onRetry ? (
          <button
            type="button"
            className="shakemap-contour-status__retry"
            onClick={onRetry}
          >
            Reintentar contornos
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="shakemap-contour-status" role="status">
      <p className="shakemap-contour-status__title">Contornos MMI listos</p>
      <p className="shakemap-contour-status__message">
        {state.deferred
          ? 'Metadatos listos; geometría aún no descargada.'
          : state.featureCount === 0
            ? 'ShakeMap respondió sin geometría MMI; la capa del mapa queda vacía.'
            : `${state.featureCount ?? 0} contorno(s) en el mapa (capa Contornos MMI).`}
      </p>
    </div>
  )
}
