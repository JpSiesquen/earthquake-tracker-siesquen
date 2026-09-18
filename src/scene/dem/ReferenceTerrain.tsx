import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry } from 'three'

import type { LonLat } from '../../../shared/earthquake.ts'

import { ReferenceSurface } from '../ReferenceSurface.tsx'
import { fetchLocalDemGrid } from './fetchLocalDem.ts'

export type DemSurfaceStatus = 'loading' | 'ready' | 'fallback'

type ReferenceTerrainProps = {
  focusCoordinates: LonLat | null
  onStatusChange?: (status: DemSurfaceStatus) => void
}

type DemLoadResult =
  | { kind: 'ready'; originKey: string; geometry: BufferGeometry }
  | { kind: 'error'; originKey: string }

function originKeyOf(coords: LonLat): string {
  return `${coords[0]},${coords[1]}`
}

/**
 * Relieve Terrarium opcional. Si falla el fetch/decode, degrada al plano
 * honesto sin tocar hipocentro ni vecinos.
 */
export function ReferenceTerrain({
  focusCoordinates,
  onStatusChange,
}: ReferenceTerrainProps) {
  const invalidate = useThree((s) => s.invalidate)
  const originKey = focusCoordinates ? originKeyOf(focusCoordinates) : null
  const [result, setResult] = useState<DemLoadResult | null>(null)

  const status: DemSurfaceStatus = !originKey
    ? 'fallback'
    : result?.originKey === originKey && result.kind === 'ready'
      ? 'ready'
      : result?.originKey === originKey && result.kind === 'error'
        ? 'fallback'
        : 'loading'

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  useEffect(() => {
    if (!focusCoordinates || !originKey) {
      return
    }

    const controller = new AbortController()
    const [longitude, latitude] = focusCoordinates

    fetchLocalDemGrid({
      originLon: longitude,
      originLat: latitude,
      signal: controller.signal,
    })
      .then((grid) => {
        if (controller.signal.aborted) {
          return
        }
        const geometry = new BufferGeometry()
        geometry.setAttribute(
          'position',
          new BufferAttribute(grid.positions, 3),
        )
        geometry.setIndex(new BufferAttribute(grid.indices, 1))
        geometry.computeVertexNormals()
        setResult({ kind: 'ready', originKey, geometry })
        invalidate()
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }
        setResult({ kind: 'error', originKey })
        invalidate()
      })

    return () => {
      controller.abort()
    }
  }, [focusCoordinates, invalidate, originKey])

  useEffect(() => {
    return () => {
      if (result?.kind === 'ready') {
        result.geometry.dispose()
      }
    }
  }, [result])

  const terrain = useMemo(() => {
    if (
      status !== 'ready' ||
      result?.kind !== 'ready' ||
      result.originKey !== originKey
    ) {
      return null
    }
    return (
      <mesh name="reference-terrain" geometry={result.geometry}>
        <meshStandardMaterial
          color="#c5d0d8"
          flatShading
          metalness={0}
          opacity={0.88}
          roughness={0.92}
          transparent
        />
      </mesh>
    )
  }, [originKey, result, status])

  if (status === 'ready' && terrain) {
    return terrain
  }

  return <ReferenceSurface />
}
