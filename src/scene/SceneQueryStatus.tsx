import { Link } from 'react-router-dom'

type SceneQueryStatusProps = {
  detailLoading: boolean
  detailError: Error | null
  neighborsLoading: boolean
  neighborsError: Error | null
  hasDetail: boolean
  backTo: string
  onRetryDetail: () => void
  onRetryNeighbors: () => void
}

/**
 * Estados visibles de detail/neighbors en Capa 2.
 * Detail fatal bloquea la lectura del foco; neighbors fallando deja escena parcial.
 */
export function SceneQueryStatus({
  detailLoading,
  detailError,
  neighborsLoading,
  neighborsError,
  hasDetail,
  backTo,
  onRetryDetail,
  onRetryNeighbors,
}: SceneQueryStatusProps) {
  if (detailError) {
    return (
      <div
        className="scene-query-status scene-query-status--error"
        role="alert"
      >
        <p className="scene-query-status__title">
          No se pudo cargar el detalle
        </p>
        <p className="scene-query-status__message">{detailError.message}</p>
        <div className="scene-query-status__actions">
          <button
            type="button"
            className="scene-query-status__button"
            onClick={onRetryDetail}
          >
            Reintentar
          </button>
          <Link className="scene-query-status__link" to={backTo}>
            Volver al mapa
          </Link>
        </div>
      </div>
    )
  }

  if (detailLoading && !hasDetail) {
    return (
      <div className="scene-query-status" role="status" aria-live="polite">
        <p className="scene-query-status__title">
          Cargando detalle del evento…
        </p>
        <p className="scene-query-status__message">
          Preparando hipocentro y vecinos FDSN.
        </p>
      </div>
    )
  }

  if (neighborsError) {
    return (
      <div
        className="scene-query-status scene-query-status--warning"
        role="status"
      >
        <p className="scene-query-status__title">
          Escena parcial: vecinos no disponibles
        </p>
        <p className="scene-query-status__message">{neighborsError.message}</p>
        <div className="scene-query-status__actions">
          <button
            type="button"
            className="scene-query-status__button"
            onClick={onRetryNeighbors}
          >
            Reintentar vecinos
          </button>
        </div>
      </div>
    )
  }

  if (neighborsLoading && hasDetail) {
    return (
      <div className="scene-query-status" role="status" aria-live="polite">
        <p className="scene-query-status__title">Cargando vecinos FDSN…</p>
        <p className="scene-query-status__message">
          El foco ya está en escena; el contexto espacial llega a continuación.
        </p>
      </div>
    )
  }

  return null
}
