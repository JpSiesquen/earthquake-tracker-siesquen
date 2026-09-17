import { useEffect, useState } from 'react'
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
import { SceneOverlay } from './SceneOverlay.tsx'
import './EventSceneCanvas.css'

/**
 * Viewport base de Capa 2. La camara orbita el epicentro sin poder cruzar el
 * plano de superficie. Los helpers espaciales existen solo en desarrollo.
 * El overlay HTML vive fuera del Canvas para no interferir con OrbitControls.
 */
type EventSceneCanvasProps = {
  eventId: string
  magnitude: number | null | undefined
  place: string | null | undefined
  backTo: string
  depthKm: number | null
  focusId: string
  focusCoordinates: LonLat | null
  neighbors: readonly EarthquakeSummary[]
}

export default function EventSceneCanvas({
  eventId,
  magnitude,
  place,
  backTo,
  depthKm,
  focusId,
  focusCoordinates,
  neighbors,
}: EventSceneCanvasProps) {
  const [reduceMotion, setReduceMotion] = useState(
    () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduceMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="event-scene-canvas" aria-label="Viewport 3D del evento">
      <SceneOverlay
        eventId={eventId}
        magnitude={magnitude}
        place={place}
        backTo={backTo}
      />
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
          enableDamping={!reduceMotion}
          dampingFactor={0.08}
          enablePan={false}
        />
      </Canvas>
    </div>
  )
}
