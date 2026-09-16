import { Canvas } from '@react-three/fiber'

import './EventSceneCanvas.css'

/**
 * Viewport base de Capa 2. El canvas es intencionalmente vacio en #81:
 * camara, controles y geometria se incorporan en issues posteriores.
 */
export default function EventSceneCanvas() {
  return (
    <div className="event-scene-canvas" aria-label="Viewport 3D del evento">
      <Canvas
        className="event-scene-canvas__renderer"
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
        fallback={
          <p className="event-scene-canvas__fallback">
            Viewport 3D. Se requiere WebGL para visualizar la escena.
          </p>
        }
      />
    </div>
  )
}
