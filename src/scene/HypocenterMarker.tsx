import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

import { depthKmToY } from '../geo/localCoordinates.ts'

import type { SceneRevealProgress } from './SceneIntro.tsx'

const HYPOCENTER_RADIUS_KM = 10

type HypocenterMarkerProps = {
  depthKm: number | null
  revealRef: MutableRefObject<SceneRevealProgress>
}

/** Foco sismico; aparece al final de la intro del conector. */
export function HypocenterMarker({
  depthKm,
  revealRef,
}: HypocenterMarkerProps) {
  const meshRef = useRef<Mesh>(null)
  const y = depthKmToY(depthKm)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh || y === null) {
      return
    }
    const p = revealRef.current.hypocenter
    mesh.visible = p > 0.02
    const s = Math.max(p, 0.0001)
    mesh.scale.setScalar(s)
  }, [revealRef, y])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh || y === null) {
      return
    }
    const p = revealRef.current.hypocenter
    mesh.visible = p > 0.02
    const s = Math.max(p, 0.0001)
    mesh.scale.setScalar(s)
  })

  if (y === null) {
    return null
  }

  return (
    <mesh
      ref={meshRef}
      name="hypocenter-marker"
      position={[0, y, 0]}
      visible={false}
      scale={0.0001}
    >
      <octahedronGeometry args={[HYPOCENTER_RADIUS_KM, 0]} />
      <meshStandardMaterial
        color="#c66f2b"
        emissive="#7a3510"
        emissiveIntensity={0.32}
        metalness={0}
        roughness={0.5}
      />
    </mesh>
  )
}
