import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

import { depthKmToY } from '../geo/localCoordinates.ts'

import type { SceneRevealProgress } from './SceneIntro.tsx'

const CONNECTOR_RADIUS_KM = 1.2

type DepthConnectorProps = {
  depthKm: number | null
  revealRef: MutableRefObject<SceneRevealProgress>
}

/** Segmento vertical entre epicentro e hipocentro; crece con la intro. */
export function DepthConnector({ depthKm, revealRef }: DepthConnectorProps) {
  const meshRef = useRef<Mesh>(null)
  const y = depthKmToY(depthKm)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh || y === null || y === 0) {
      return
    }
    const p = Math.max(revealRef.current.connector, 0.0001)
    mesh.scale.set(1, p, 1)
    mesh.position.set(0, (y * p) / 2, 0)
    mesh.visible = revealRef.current.connector > 0
  }, [revealRef, y])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh || y === null || y === 0) {
      return
    }
    const p = Math.max(revealRef.current.connector, 0.0001)
    mesh.scale.set(1, p, 1)
    mesh.position.set(0, (y * p) / 2, 0)
    mesh.visible = revealRef.current.connector > 0
  })

  if (y === null || y === 0) {
    return null
  }

  return (
    <mesh
      ref={meshRef}
      name="depth-connector"
      position={[0, y / 2, 0]}
      visible={false}
    >
      <cylinderGeometry
        args={[CONNECTOR_RADIUS_KM, CONNECTOR_RADIUS_KM, Math.abs(y), 12]}
      />
      <meshBasicMaterial
        color="#53697d"
        depthWrite={false}
        opacity={0.62}
        transparent
        toneMapped={false}
      />
    </mesh>
  )
}
