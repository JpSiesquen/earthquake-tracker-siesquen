import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

import {
  SCENE_CAMERA_INTRO_POSITION,
  SCENE_CAMERA_POSITION,
  SCENE_INTRO_DURATION_S,
  SCENE_ORIGIN,
} from './sceneCamera.ts'
import {
  connectorRevealProgress,
  easeOutCubic,
  hypocenterRevealProgress,
} from './sceneIntro.ts'

export type SceneRevealProgress = {
  connector: number
  hypocenter: number
}

type SceneIntroProps = {
  reduceMotion: boolean
  revealRef: MutableRefObject<SceneRevealProgress>
  onDone: () => void
}

const introFrom = new Vector3(...SCENE_CAMERA_INTRO_POSITION)
const introTo = new Vector3(...SCENE_CAMERA_POSITION)
const lookAt = new Vector3(...SCENE_ORIGIN)

/**
 * Intro de camara bajo frameloop="demand". Escribe progreso en `revealRef`
 * para que conector/hipocentro muten en useFrame sin re-render por tick.
 */
export function SceneIntro({
  reduceMotion,
  revealRef,
  onDone,
}: SceneIntroProps) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const elapsedRef = useRef(0)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useLayoutEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useLayoutEffect(() => {
    doneRef.current = false
    elapsedRef.current = 0

    if (reduceMotion) {
      camera.position.set(...SCENE_CAMERA_POSITION)
      camera.lookAt(lookAt)
      revealRef.current = { connector: 1, hypocenter: 1 }
      doneRef.current = true
      onDoneRef.current()
      invalidate()
      return
    }

    camera.position.copy(introFrom)
    camera.lookAt(lookAt)
    revealRef.current = { connector: 0, hypocenter: 0 }
    invalidate()
  }, [camera, invalidate, reduceMotion, revealRef])

  useFrame((_, delta) => {
    if (reduceMotion || doneRef.current) {
      return
    }

    elapsedRef.current = Math.min(
      SCENE_INTRO_DURATION_S,
      elapsedRef.current + delta,
    )
    const linear = elapsedRef.current / SCENE_INTRO_DURATION_S
    const eased = easeOutCubic(linear)

    camera.position.lerpVectors(introFrom, introTo, eased)
    camera.lookAt(lookAt)
    revealRef.current = {
      connector: connectorRevealProgress(linear),
      hypocenter: hypocenterRevealProgress(linear),
    }
    invalidate()

    if (linear >= 1) {
      doneRef.current = true
      camera.position.copy(introTo)
      revealRef.current = { connector: 1, hypocenter: 1 }
      onDoneRef.current()
    }
  })

  return null
}
