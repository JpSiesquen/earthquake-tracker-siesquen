import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { SCENE_CAMERA, SCENE_CONTROLS, SCENE_ORIGIN } from './sceneCamera.ts'
import './EventSceneCanvas.css'

/**
 * Viewport base de Capa 2. La camara orbita el epicentro sin poder cruzar el
 * plano de superficie; geometria e iluminacion llegan en issues posteriores.
 */
export default function EventSceneCanvas() {
  return (
    <div className="event-scene-canvas" aria-label="Viewport 3D del evento">
      <Canvas
        camera={SCENE_CAMERA}
        className="event-scene-canvas__renderer"
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
        fallback={
          <p className="event-scene-canvas__fallback">
            Viewport 3D. Se requiere WebGL para visualizar la escena.
          </p>
        }
      >
        <OrbitControls
          makeDefault
          target={SCENE_ORIGIN}
          minDistance={SCENE_CONTROLS.minDistance}
          maxDistance={SCENE_CONTROLS.maxDistance}
          minPolarAngle={SCENE_CONTROLS.minPolarAngle}
          maxPolarAngle={SCENE_CONTROLS.maxPolarAngle}
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
        />
      </Canvas>
    </div>
  )
}
