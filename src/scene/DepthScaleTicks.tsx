import { Html } from '@react-three/drei'

import { depthKmToY } from '../geo/localCoordinates.ts'

import { depthTickMarksKm } from './sceneScaleMarks.ts'

const TICK_LENGTH_KM = 7
const TICK_OFFSET_X_KM = 5

type DepthScaleTicksProps = {
  depthKm: number | null
}

/**
 * Marcas de profundidad reales junto al conector. Sin inventar profundidad.
 */
export function DepthScaleTicks({ depthKm }: DepthScaleTicksProps) {
  if (depthKm === null || depthKm <= 0) {
    return null
  }

  const marks = depthTickMarksKm(depthKm)

  return (
    <group name="depth-scale-ticks">
      {marks.map((markKm) => {
        const y = depthKmToY(markKm)
        if (y === null) {
          return null
        }

        const isFocus = markKm === depthKm

        return (
          <group key={markKm} position={[TICK_OFFSET_X_KM, y, 0]}>
            <mesh position={[TICK_LENGTH_KM / 2, 0, 0]}>
              <boxGeometry args={[TICK_LENGTH_KM, 0.55, 0.55]} />
              <meshBasicMaterial
                color={isFocus ? '#6a5a48' : '#6d7f8f'}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <Html
              position={[TICK_LENGTH_KM + 4, 0, 0]}
              center
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <span
                className={
                  isFocus
                    ? 'scene-scale-label scene-scale-label--focus'
                    : 'scene-scale-label'
                }
              >
                {formatDepthLabel(markKm)}
              </span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function formatDepthLabel(depthKm: number): string {
  const rounded =
    depthKm >= 100 ? Math.round(depthKm) : Math.round(depthKm * 10) / 10
  return `${rounded} km`
}
