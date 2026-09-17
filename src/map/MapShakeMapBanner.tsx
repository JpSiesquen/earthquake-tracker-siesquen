import type { ShakeMapContourUiState } from './shakeMapContourStatus.ts'

import './MapShakeMapBanner.css'

type MapShakeMapBannerProps = {
  state: ShakeMapContourUiState | null
  onRetry?: () => void
}

/**
 * Aviso corto junto al mapa para carga/error de contornos MMI (#231).
 * Sin producto: no renderiza (evita banner vacío permanente).
 */
export function MapShakeMapBanner({ state, onRetry }: MapShakeMapBannerProps) {
  if (state === null) return null

  if (state.kind === 'loading') {
    return (
      <div
        className="map-shakemap-banner"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        Cargando contornos MMI…
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div
        className="map-shakemap-banner map-shakemap-banner--error"
        role="alert"
      >
        <span>Contornos MMI no disponibles.</span>
        {onRetry ? (
          <button
            type="button"
            className="map-shakemap-banner__retry"
            onClick={onRetry}
          >
            Reintentar
          </button>
        ) : null}
      </div>
    )
  }

  return null
}
