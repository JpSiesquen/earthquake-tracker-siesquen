import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry } from 'three'

import type { LonLat } from '../../../shared/earthquake.ts'

import { ReferenceSurface } from '../ReferenceSurface.tsx'
import { fetchLocalDemGrid } from './fetchLocalDem.ts'

export type DemSurfaceStatus = 'loading' | 'ready' | 'fallback'

/** Clasificacion del suelo cuando el DEM esta listo. */
export type DemSurfaceKind = 'land' | 'water' | 'mixed' | null

type ReferenceTerrainProps = {
  focusCoordinates: LonLat | null
  onStatusChange?: (status: DemSurfaceStatus) => void
  onSurfaceKindChange?: (kind: DemSurfaceKind) => void
}

type DemLoadResult =
  | {
      kind: 'ready'
      originKey: string
      geometry: BufferGeometry
      surfaceKind: Exclude<DemSurfaceKind, null>
    }
  | { kind: 'error'; originKey: string }

function originKeyOf(coords: LonLat): string {
  return `${coords[0]},${coords[1]}`
}

function classifySurface(
  originIsWater: boolean,
  waterFraction: number,
): Exclude<DemSurfaceKind, null> {
  if (originIsWater && waterFraction >= 0.7) {
    return 'water'
  }
  if (!originIsWater && waterFraction <= 0.25) {
    return 'land'
  }
  return 'mixed'
}

/**
 * Relieve Terrarium opcional. Tierra con relieve; agua como superficie marina
 * (color distinto, Y=0). Si falla el fetch/decode, degrada al plano honesto.
 */
export function ReferenceTerrain({
  focusCoordinates,
  onStatusChange,
  onSurfaceKindChange,
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

  const surfaceKind: DemSurfaceKind =
    status === 'ready' && result?.kind === 'ready' ? result.surfaceKind : null

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  useEffect(() => {
    onSurfaceKindChange?.(surfaceKind)
  }, [onSurfaceKindChange, surfaceKind])

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
        geometry.setAttribute('color', new BufferAttribute(grid.colors, 3))
        geometry.setIndex(new BufferAttribute(grid.indices, 1))
        geometry.computeVertexNormals()
        setResult({
          kind: 'ready',
          originKey,
          geometry,
          surfaceKind: classifySurface(grid.originIsWater, grid.waterFraction),
        })
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
          vertexColors
          flatShading
          metalness={0}
          opacity={0.9}
          roughness={0.9}
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
