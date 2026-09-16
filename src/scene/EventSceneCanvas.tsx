import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import type { EarthquakeSummary, LonLat } from '../../shared/earthquake.ts'

import { DepthConnector } from './DepthConnector.tsx'
import { EpicenterMarker } from './EpicenterMarker.tsx'
import { HypocenterMarker } from './HypocenterMarker.tsx'
import { NeighborMarkers } from './NeighborMarkers.tsx'
import { SCENE_CAMERA, SCENE_CONTROLS, SCENE_ORIGIN } from './sceneCamera.ts'
import { ReferenceSurface } from './ReferenceSurface.tsx'
import { SceneDebugHelpers } from './SceneDebugHelpers.tsx'
import { SceneLighting } from './SceneLighting.tsx'
import './EventSceneCanvas.css'

/**
 * Viewport base de Capa 2. La camara orbita el epicentro sin poder cruzar el
 * plano de superficie. Los helpers espaciales existen solo en desarrollo.
 */
type EventSceneCanvasProps = {
  depthKm: number | null
  focusId: string
  focusCoordinates: LonLat | null
  neighbors: readonly EarthquakeSummary[]
}

export default function EventSceneCanvas({
  depthKm,
  focusId,
  focusCoordinates,
  neighbors,
}: EventSceneCanvasProps) {
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
        <SceneLighting />
        <ReferenceSurface />
        {focusCoordinates ? (
          <NeighborMarkers
            focusId={focusId}
            focusCoordinates={focusCoordinates}
            neighbors={neighbors}
          />
        ) : null}
        <DepthConnector depthKm={depthKm} />
        <EpicenterMarker />
        <HypocenterMarker depthKm={depthKm} />
        <SceneDebugHelpers />
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
