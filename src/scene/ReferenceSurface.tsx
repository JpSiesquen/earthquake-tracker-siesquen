import { REFERENCE_SURFACE_SIZE_KM } from './sceneScale.ts'

/** Plano de referencia analitico; no representa topografia ni tiles reales. */
export function ReferenceSurface() {
  return (
    <mesh name="reference-surface" rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[REFERENCE_SURFACE_SIZE_KM, REFERENCE_SURFACE_SIZE_KM]}
      />
      <meshStandardMaterial
        color="#d8e0e6"
        depthWrite={false}
        metalness={0}
        opacity={0.72}
        roughness={0.94}
        transparent
      />
    </mesh>
  )
}
