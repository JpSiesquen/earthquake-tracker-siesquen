import { useFrame, useThree } from '@react-three/fiber'

type DemandAutoOrbitProps = {
  active: boolean
}

/**
 * Con frameloop="demand", OrbitControls.autoRotate necesita invalidate por frame.
 */
export function DemandAutoOrbit({ active }: DemandAutoOrbitProps) {
  const invalidate = useThree((s) => s.invalidate)

  useFrame(() => {
    if (active) {
      invalidate()
    }
  })

  return null
}
