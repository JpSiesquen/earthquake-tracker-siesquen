const EPICENTER_INNER_RADIUS_KM = 10
const EPICENTER_OUTER_RADIUS_KM = 16
const EPICENTER_CENTER_RADIUS_KM = 3.5

/**
 * Diana superficial del evento foco. Permanece plana en Y=0 para diferenciarla
 * del hipocentro volumetrico que se representara bajo la superficie.
 */
export function EpicenterMarker() {
  return (
    <group name="epicenter-marker">
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <ringGeometry
          args={[EPICENTER_INNER_RADIUS_KM, EPICENTER_OUTER_RADIUS_KM, 48]}
        />
        <meshBasicMaterial
          color="#28527a"
          polygonOffset
          polygonOffsetFactor={-2}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[EPICENTER_CENTER_RADIUS_KM, 32]} />
        <meshBasicMaterial
          color="#28527a"
          polygonOffset
          polygonOffsetFactor={-2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
