import type { Vector3Tuple } from 'three'

const KEY_LIGHT_POSITION: Vector3Tuple = [8, 12, 6]

/**
 * Iluminacion base neutra-calida para materiales fisicos. La luz ambiente
 * conserva detalle en sombra; la direccional aporta volumen sin look HDR.
 * Sombras permanecen desactivadas hasta demostrar que aportan a la lectura.
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight color="#dfe8ef" intensity={0.7} />
      <directionalLight
        color="#fff4df"
        intensity={1.2}
        position={KEY_LIGHT_POSITION}
        castShadow={false}
      />
    </>
  )
}
