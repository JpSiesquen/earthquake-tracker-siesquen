import { depthKmToY } from '../geo/localCoordinates.ts'

const HYPOCENTER_RADIUS_KM = 10

type HypocenterMarkerProps = {
  depthKm: number | null
}

/** Marcador volumetrico del foco sismico; profundidad positiva desciende en Y. */
export function HypocenterMarker({ depthKm }: HypocenterMarkerProps) {
  const y = depthKmToY(depthKm)

  if (y === null) {
    return null
  }

  return (
    <mesh name="hypocenter-marker" position={[0, y, 0]}>
      <octahedronGeometry args={[HYPOCENTER_RADIUS_KM, 0]} />
      <meshStandardMaterial
        color="#c66f2b"
        emissive="#5f2708"
        emissiveIntensity={0.18}
        metalness={0}
        roughness={0.58}
      />
    </mesh>
  )
}
