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
        args={[24, 24, '#78909c', '#c7d0d6']}
        position={[0, -0.01, 0]}
      />
      <axesHelper args={[4]} />
    </group>
  )
}
