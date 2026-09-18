import { useCallback, useEffect, useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import type { EarthquakeSummary, LonLat } from '../../shared/earthquake.ts'

import { DepthConnector } from './DepthConnector.tsx'
import { DepthScaleTicks } from './DepthScaleTicks.tsx'
import { DemandAutoOrbit } from './DemandAutoOrbit.tsx'
import { EpicenterMarker } from './EpicenterMarker.tsx'
import { HypocenterMarker } from './HypocenterMarker.tsx'
import { NeighborMarkers } from './NeighborMarkers.tsx'
import {
  SCENE_CAMERA,
  SCENE_CAMERA_INTRO_POSITION,
  SCENE_CAMERA_POSITION,
  SCENE_CONTROLS,
  SCENE_ORIGIN,
} from './sceneCamera.ts'
import { ReferenceDistanceRings } from './ReferenceDistanceRings.tsx'
import {
  ReferenceTerrain,
  type DemSurfaceKind,
  type DemSurfaceStatus,
} from './dem/ReferenceTerrain.tsx'
import { SceneDebugHelpers } from './SceneDebugHelpers.tsx'
import { SceneIntro, type SceneRevealProgress } from './SceneIntro.tsx'
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
  const [introDone, setIntroDone] = useState(reduceMotion)
  const revealRef = useRef<SceneRevealProgress>({
    connector: reduceMotion ? 1 : 0,
    hypocenter: reduceMotion ? 1 : 0,
  })

  useEffect(() => {
    const media = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReduceMotion(media.matches)
      if (media.matches) {
        revealRef.current = { connector: 1, hypocenter: 1 }
        setIntroDone(true)
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const onIntroDone = useCallback(() => {
    setIntroDone(true)
  }, [])

  const [demStatus, setDemStatus] = useState<DemSurfaceStatus>(
    focusCoordinates ? 'loading' : 'fallback',
  )
  const [demSurfaceKind, setDemSurfaceKind] = useState<DemSurfaceKind>(null)
  const onDemStatusChange = useCallback((status: DemSurfaceStatus) => {
    setDemStatus(status)
  }, [])
  const onDemSurfaceKindChange = useCallback((kind: DemSurfaceKind) => {
    setDemSurfaceKind(kind)
  }, [])

  const [userTookControl, setUserTookControl] = useState(false)
  const [orbitHintVisible, setOrbitHintVisible] = useState(
    () => !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const autoOrbit = introDone && !reduceMotion && !userTookControl

  const onOrbitInteractionStart = useCallback(() => {
    setUserTookControl(true)
    setOrbitHintVisible(false)
  }, [])

  const dismissOrbitHint = useCallback(() => {
    setOrbitHintVisible(false)
  }, [])

  const cameraPosition = reduceMotion
    ? SCENE_CAMERA_POSITION
    : SCENE_CAMERA_INTRO_POSITION

  return (
    <div className="event-scene-canvas" aria-label="Viewport 3D del evento">
      <SceneOverlay
        eventId={eventId}
        magnitude={magnitude}
        place={place}
        backTo={backTo}
        demStatus={demStatus}
        demSurfaceKind={demSurfaceKind}
      />
      {orbitHintVisible && introDone ? (
        <button
          type="button"
          className="event-scene-canvas__orbit-hint"
          onClick={dismissOrbitHint}
        >
          Arrastra para orbitar
        </button>
      ) : null}
      <Canvas
        camera={{ ...SCENE_CAMERA, position: cameraPosition }}
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
        <SceneIntro
          reduceMotion={reduceMotion}
          revealRef={revealRef}
          onDone={onIntroDone}
        />
        <DemandAutoOrbit active={autoOrbit} />
        <SceneLighting />
        <ReferenceTerrain
          focusCoordinates={focusCoordinates}
          onStatusChange={onDemStatusChange}
          onSurfaceKindChange={onDemSurfaceKindChange}
        />
        <ReferenceDistanceRings />
        {focusCoordinates ? (
          <NeighborMarkers
            focusId={focusId}
            focusCoordinates={focusCoordinates}
            neighbors={neighbors}
          />
        ) : null}
        <DepthConnector depthKm={depthKm} revealRef={revealRef} />
        <DepthScaleTicks depthKm={depthKm} />
        <EpicenterMarker reduceMotion={reduceMotion} />
        <HypocenterMarker depthKm={depthKm} revealRef={revealRef} />
        <SceneDebugHelpers />
        <OrbitControls
          makeDefault
          enabled={introDone}
          target={SCENE_ORIGIN}
          minDistance={SCENE_CONTROLS.minDistance}
          maxDistance={SCENE_CONTROLS.maxDistance}
          minPolarAngle={SCENE_CONTROLS.minPolarAngle}
          maxPolarAngle={SCENE_CONTROLS.maxPolarAngle}
          enableDamping={!reduceMotion}
          dampingFactor={0.08}
          enablePan={false}
          autoRotate={autoOrbit}
          autoRotateSpeed={0.35}
          onStart={onOrbitInteractionStart}
        />
      </Canvas>
    </div>
  )
}
