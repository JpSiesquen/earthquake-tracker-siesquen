import type { Vector3Tuple } from 'three'

import { REFERENCE_SURFACE_SIZE_KM } from './sceneScale.ts'

/**
 * Convencion local de Capa 2: Y es vertical, la superficie esta en Y=0 y el
 * epicentro ocupa el origen. La camara encuadra el suelo local de 500 km desde
 * una diagonal elevada para leer superficie y profundidad.
 */
export const SCENE_CAMERA_POSITION: Vector3Tuple = [
  REFERENCE_SURFACE_SIZE_KM * 0.64,
  REFERENCE_SURFACE_SIZE_KM * 0.48,
  REFERENCE_SURFACE_SIZE_KM * 0.72,
]
export const SCENE_ORIGIN: Vector3Tuple = [0, 0, 0]

export const SCENE_CAMERA = {
  position: SCENE_CAMERA_POSITION,
  fov: 42,
  near: 0.1,
  far: 2_500,
} as const

export const SCENE_CONTROLS = {
  minDistance: 80,
  maxDistance: REFERENCE_SURFACE_SIZE_KM * 2.4,
  /** Evita el polo superior y el gimbal visual de una vista casi cenital. */
  minPolarAngle: (25 * Math.PI) / 180,
  /** Mantiene la camara sobre el plano de referencia Y=0. */
  maxPolarAngle: (85 * Math.PI) / 180,
} as const
