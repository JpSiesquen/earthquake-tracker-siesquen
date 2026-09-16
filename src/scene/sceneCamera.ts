import type { Vector3Tuple } from 'three'

/**
 * Convencion local de Capa 2: Y es vertical, la superficie esta en Y=0 y el
 * epicentro ocupa el origen. La camara parte elevada y en diagonal para leer
 * superficie y profundidad sin una vista cenital ambigua.
 */
export const SCENE_CAMERA_POSITION: Vector3Tuple = [12, 8, 14]
export const SCENE_ORIGIN: Vector3Tuple = [0, 0, 0]

export const SCENE_CAMERA = {
  position: SCENE_CAMERA_POSITION,
  fov: 42,
  near: 0.1,
  far: 200,
} as const

export const SCENE_CONTROLS = {
  minDistance: 6,
  maxDistance: 40,
  /** Evita el polo superior y el gimbal visual de una vista casi cenital. */
  minPolarAngle: (25 * Math.PI) / 180,
  /** Mantiene la camara sobre el plano de referencia Y=0. */
  maxPolarAngle: (85 * Math.PI) / 180,
} as const
