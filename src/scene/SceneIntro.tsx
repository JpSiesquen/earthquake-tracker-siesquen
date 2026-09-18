import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Vector3Tuple } from 'three'

import { SCENE_INTRO_DURATION_S } from './sceneCamera.ts'
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
  /** Pose final del encuadre (intro aterriza aqui). */
  cameraPosition: Vector3Tuple
  introPosition: Vector3Tuple
  lookAtTarget: Vector3Tuple
}

/**
 * Intro de camara bajo frameloop="demand". Escribe progreso en `revealRef`
 * para que conector/hipocentro muten en useFrame sin re-render por tick.
 */
export function SceneIntro({
  reduceMotion,
  revealRef,
  onDone,
  cameraPosition,
  introPosition,
  lookAtTarget,
}: SceneIntroProps) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const elapsedRef = useRef(0)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const introFrom = useRef(new Vector3(...introPosition))
  const introTo = useRef(new Vector3(...cameraPosition))
  const lookAt = useRef(new Vector3(...lookAtTarget))

  useLayoutEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useLayoutEffect(() => {
    doneRef.current = false
    elapsedRef.current = 0
    introFrom.current.set(...introPosition)
    introTo.current.set(...cameraPosition)
    lookAt.current.set(...lookAtTarget)

    if (reduceMotion) {
      camera.position.set(...cameraPosition)
      camera.lookAt(lookAt.current)
      revealRef.current = { connector: 1, hypocenter: 1 }
      doneRef.current = true
      onDoneRef.current()
      invalidate()
      return
    }

    camera.position.copy(introFrom.current)
    camera.lookAt(lookAt.current)
    revealRef.current = { connector: 0, hypocenter: 0 }
    invalidate()
  }, [
    camera,
    cameraPosition,
    invalidate,
    introPosition,
    lookAtTarget,
    reduceMotion,
    revealRef,
  ])

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

    camera.position.lerpVectors(introFrom.current, introTo.current, eased)
    camera.lookAt(lookAt.current)
    revealRef.current = {
      connector: connectorRevealProgress(linear),
      hypocenter: hypocenterRevealProgress(linear),
    }
    invalidate()

    if (linear >= 1) {
      doneRef.current = true
      camera.position.copy(introTo.current)
      revealRef.current = { connector: 1, hypocenter: 1 }
      onDoneRef.current()
    }
  })

  return null
}
