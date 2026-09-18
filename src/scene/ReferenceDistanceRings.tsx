import { Html } from '@react-three/drei'

import { DISTANCE_RING_RADII_KM } from './sceneScaleMarks.ts'

const RING_Y = 0.12
const RING_HALF_WIDTH_KM = 0.45

/**
 * Anillos concentricos sutiles en el plano de referencia (escala horizontal).
 * Estaticos: legibles con o sin reduced-motion.
 */
export function ReferenceDistanceRings() {
  return (
    <group name="reference-distance-rings">
      {DISTANCE_RING_RADII_KM.map((radiusKm) => (
        <group key={radiusKm}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, RING_Y, 0]}>
            <ringGeometry
              args={[
                radiusKm - RING_HALF_WIDTH_KM,
                radiusKm + RING_HALF_WIDTH_KM,
                96,
              ]}
            />
            <meshBasicMaterial
              color="#7a8d9c"
              depthWrite={false}
              opacity={radiusKm === 100 ? 0.42 : 0.28}
              transparent
              toneMapped={false}
            />
          </mesh>
          <Html
            position={[radiusKm, RING_Y + 0.4, 0]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <span className="scene-scale-label">{radiusKm} km</span>
          </Html>
        </group>
      ))}
    </group>
  )
}
