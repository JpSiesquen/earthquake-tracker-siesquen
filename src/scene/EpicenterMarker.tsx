import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Mesh } from 'three'

const EPICENTER_INNER_RADIUS_KM = 10
const EPICENTER_OUTER_RADIUS_KM = 16
const EPICENTER_CENTER_RADIUS_KM = 3.5
/** Un solo pulso lento; no loop continuo (respeta frameloop demand). */
const PULSE_DURATION_S = 1.35
const PULSE_SCALE = 0.14

type EpicenterMarkerProps = {
  reduceMotion: boolean
}

/**
 * Diana superficial del evento foco. Pulso unico opcional para jerarquia visual.
 */
export function EpicenterMarker({ reduceMotion }: EpicenterMarkerProps) {
  const ringRef = useRef<Mesh>(null)
  const elapsedRef = useRef(0)
  const doneRef = useRef(reduceMotion)
  const invalidate = useThree((s) => s.invalidate)

  useFrame((_, delta) => {
    if (reduceMotion || doneRef.current) {
      return
    }

    const ring = ringRef.current
    if (!ring) {
      return
    }

    elapsedRef.current = Math.min(PULSE_DURATION_S, elapsedRef.current + delta)
    const t = elapsedRef.current / PULSE_DURATION_S
    const scale = 1 + PULSE_SCALE * Math.sin(t * Math.PI)
    ring.scale.set(scale, scale, 1)
    invalidate()

    if (t >= 1) {
      doneRef.current = true
      ring.scale.set(1, 1, 1)
    }
  })

  return (
    <group name="epicenter-marker">
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <ringGeometry
          args={[EPICENTER_INNER_RADIUS_KM, EPICENTER_OUTER_RADIUS_KM, 48]}
        />
        <meshBasicMaterial
          color="#1f4a72"
          polygonOffset
          polygonOffsetFactor={-2}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[EPICENTER_CENTER_RADIUS_KM, 32]} />
        <meshBasicMaterial
          color="#1f4a72"
          polygonOffset
          polygonOffsetFactor={-2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
