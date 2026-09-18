import type { Vector3Tuple } from 'three'

import type { EarthquakeSummary, LonLat } from '../../shared/earthquake.ts'

import {
  depthKmToY,
  projectLatLonToLocalXZ,
  type GeographicPoint,
} from '../geo/localCoordinates.ts'
import { SCENE_NEIGHBOR_RENDER_CAP } from './neighborMagnitude.ts'
import {
  SCENE_CAMERA_POSITION,
  SCENE_CONTROLS,
  SCENE_ORIGIN,
} from './sceneCamera.ts'

export type SceneFraming = {
  position: Vector3Tuple
  introPosition: Vector3Tuple
  target: Vector3Tuple
}

function toGeographic([longitude, latitude]: LonLat): GeographicPoint {
  return { latitude, longitude }
}

function vectorLength(v: Vector3Tuple): number {
  return Math.hypot(v[0], v[1], v[2])
}

function scaleVector(v: Vector3Tuple, scale: number): Vector3Tuple {
  return [v[0] * scale, v[1] * scale, v[2] * scale]
}

/**
 * Encuadre diagonal segun profundidad del foco y dispersion de vecinos.
 * Conserva la direccion de SCENE_CAMERA_POSITION; solo escala distancia y
 * baja levemente el target hacia el hipocentro cuando hay depth.
 */
export function computeSceneFraming({
  depthKm,
  focusId,
  focusCoordinates,
  neighbors,
}: {
  depthKm: number | null
  focusId: string
  focusCoordinates: LonLat | null
  neighbors: readonly EarthquakeSummary[]
}): SceneFraming {
  const depthY = depthKmToY(depthKm)
  const depthSpanKm = depthY === null ? 0 : Math.abs(depthY)

  let neighborRadiusKm = 60
  if (focusCoordinates) {
    const origin = toGeographic(focusCoordinates)
    let count = 0
    for (const neighbor of neighbors) {
      if (count >= SCENE_NEIGHBOR_RENDER_CAP) {
        break
      }
      if (neighbor.id === focusId || neighbor.depthKm === null) {
        continue
      }
      const { x, z } = projectLatLonToLocalXZ(
        toGeographic(neighbor.coordinates),
        origin,
      )
      neighborRadiusKm = Math.max(neighborRadiusKm, Math.hypot(x, z))
      count += 1
    }
  }

  const baseDist = vectorLength(SCENE_CAMERA_POSITION)
  const neededDist = Math.max(
    baseDist * 0.72,
    neighborRadiusKm * 1.65,
    depthSpanKm * 2.1 + 110,
  )

  const minScale = SCENE_CONTROLS.minDistance / baseDist
  const maxScale = SCENE_CONTROLS.maxDistance / baseDist
  const scale = Math.min(maxScale, Math.max(minScale, neededDist / baseDist))

  const position = scaleVector(SCENE_CAMERA_POSITION, scale)
  const introPosition = scaleVector(position, 1.38)
  // Un poco mas alto en la intro para el aterrizaje.
  introPosition[1] = position[1] * 1.55

  const target: Vector3Tuple =
    depthY === null ? SCENE_ORIGIN : [0, depthY * 0.28, 0]

  return { position, introPosition, target }
}
