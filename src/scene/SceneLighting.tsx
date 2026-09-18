import type { Vector3Tuple } from 'three'

const KEY_LIGHT_POSITION: Vector3Tuple = [8, 12, 6]
const FILL_LIGHT_POSITION: Vector3Tuple = [-7, 5, -5]

/**
 * Iluminacion de laboratorio: hemisferica + key/fill sin HDR ni bloom.
 * Fog ligera da volumen bajo el plano; sombras siguen off (coste mid-range).
 */
export function SceneLighting() {
  return (
    <>
      <hemisphereLight color="#e7eef4" groundColor="#7d868e" intensity={0.58} />
      <ambientLight color="#d5dee6" intensity={0.22} />
      <directionalLight
        color="#fff1dc"
        intensity={1.05}
        position={KEY_LIGHT_POSITION}
        castShadow={false}
      />
      <directionalLight
        color="#b9c8d4"
        intensity={0.32}
        position={FILL_LIGHT_POSITION}
        castShadow={false}
      />
      {/* near/far en unidades km de la escena; no oscurece el overlay HTML */}
      <fog attach="fog" args={['#e4e9e6', 320, 1_050]} />
    </>
  )
}
