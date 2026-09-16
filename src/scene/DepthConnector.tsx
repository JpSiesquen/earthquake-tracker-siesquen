import { depthKmToY } from '../geo/localCoordinates.ts'

const CONNECTOR_RADIUS_KM = 1.2

type DepthConnectorProps = {
  depthKm: number | null
}

/** Segmento vertical estatico entre el epicentro y el foco sismico. */
export function DepthConnector({ depthKm }: DepthConnectorProps) {
  const y = depthKmToY(depthKm)

  if (y === null || y === 0) {
    return null
  }

  return (
    <mesh name="depth-connector" position={[0, y / 2, 0]}>
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
