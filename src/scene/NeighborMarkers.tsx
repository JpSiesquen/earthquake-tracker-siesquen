import type { EarthquakeSummary, LonLat } from '../../shared/earthquake.ts'

import { depthKmToColor } from '../geo/depthBands.ts'
import {
  depthKmToY,
  projectLatLonToLocalXZ,
  type GeographicPoint,
} from '../geo/localCoordinates.ts'
import {
  magnitudeToNeighborRadiusKm,
  SCENE_NEIGHBOR_RENDER_CAP,
} from './neighborMagnitude.ts'

type NeighborMarkersProps = {
  focusId: string
  focusCoordinates: LonLat
  neighbors: readonly EarthquakeSummary[]
}

function toGeographic([longitude, latitude]: LonLat): GeographicPoint {
  return { latitude, longitude }
}

/**
 * Vecinos FDSN alrededor del foco. El evento seleccionado no se repite aqui:
 * ya se filtra en el fetch (#73) y se vuelve a excluir por id por defensa.
 * Sin profundidad conocida no hay posicion honesta → se omite.
 * Cap de render: `SCENE_NEIGHBOR_RENDER_CAP` (alineado a `NEIGHBOR_LIMIT`).
 * Color = banda de profundidad (misma paleta que el mapa 2D); no tiempo.
 */
export function NeighborMarkers({
  focusId,
  focusCoordinates,
  neighbors,
}: NeighborMarkersProps) {
  const origin = toGeographic(focusCoordinates)

  const markers = []
  for (const neighbor of neighbors) {
    if (markers.length >= SCENE_NEIGHBOR_RENDER_CAP) {
      break
    }

    if (neighbor.id === focusId || neighbor.depthKm === null) {
      continue
    }

    const y = depthKmToY(neighbor.depthKm)
    if (y === null) {
      continue
    }

    const { x, z } = projectLatLonToLocalXZ(
      toGeographic(neighbor.coordinates),
      origin,
    )
    const radius = magnitudeToNeighborRadiusKm(neighbor.magnitude)

    markers.push(
      <mesh
        key={neighbor.id}
        name={`neighbor-${neighbor.id}`}
        position={[x, y, z]}
      >
        <sphereGeometry args={[radius, 16, 12]} />
        <meshStandardMaterial
          color={depthKmToColor(neighbor.depthKm)}
          metalness={0}
          roughness={0.72}
        />
      </mesh>,
    )
  }

  if (markers.length === 0) {
    return null
  }

  return <group name="neighbor-markers">{markers}</group>
}
