import { REFERENCE_SURFACE_SIZE_KM } from './sceneScale.ts'

/**
 * Referencias espaciales de desarrollo. No forman parte de la escena de
 * producto y se eliminan del arbol renderizado en builds de produccion.
 */
export function SceneDebugHelpers() {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <group name="scene-debug-helpers">
      <gridHelper
        args={[REFERENCE_SURFACE_SIZE_KM, 20, '#78909c', '#c7d0d6']}
        position={[0, 0.1, 0]}
      />
      <axesHelper args={[80]} />
    </group>
  )
}
