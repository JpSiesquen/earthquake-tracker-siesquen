import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Color } from 'three'

/**
 * Probe de integración de #80. Este modulo se importa bajo demanda desde
 * Capa 2; los imports nombrados permiten tree-shaking sin adelantar el Canvas.
 */
export function probeR3FStack(): void {
  if (![Canvas, OrbitControls, Color].every(Boolean)) {
    throw new Error('3D stack imports are unavailable')
  }
}
