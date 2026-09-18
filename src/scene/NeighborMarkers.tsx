import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

import type { EarthquakeSummary, LonLat } from '../../shared/earthquake.ts'

import { depthKmToColor } from '../geo/depthBands.ts'
import {
  depthKmToY,
  projectLatLonToLocalXZ,
  type GeographicPoint,
} from '../geo/localCoordinates.ts'
import {
  magnitudeToNeighborRadiusKm,
  SCENE_NEIGHBOR_RENDER_CAP,
} from './neighborMagnitude.ts'

type NeighborMarkersProps = {
  focusId: string
  focusCoordinates: LonLat
  neighbors: readonly EarthquakeSummary[]
  reduceMotion: boolean
}

function toGeographic([longitude, latitude]: LonLat): GeographicPoint {
  return { latitude, longitude }
}

function formatMagnitude(magnitude: number | null): string {
  return typeof magnitude === 'number' && Number.isFinite(magnitude)
    ? magnitude.toFixed(1)
    : '—'
}

function formatDepth(depthKm: number): string {
  const rounded =
    depthKm >= 100 ? Math.round(depthKm) : Math.round(depthKm * 10) / 10
  return `${rounded} km`
}

function formatPlace(place: string | null): string {
  const trimmed = place?.trim()
  if (!trimmed) {
    return 'Sin lugar'
  }
  return trimmed.length > 42 ? `${trimmed.slice(0, 40)}…` : trimmed
}

type NeighborSphereProps = {
  neighbor: EarthquakeSummary
  position: [number, number, number]
  radius: number
  depthKm: number
  staggerIndex: number
  reduceMotion: boolean
}

function NeighborSphere({
  neighbor,
  position,
  radius,
  depthKm,
  staggerIndex,
  reduceMotion,
}: NeighborSphereProps) {
  const [hovered, setHovered] = useState(false)
  const [revealed, setRevealed] = useState(reduceMotion)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      return
    }
    const delayMs = Math.min(staggerIndex, 40) * 28
    const timer = globalThis.setTimeout(() => {
      setRevealed(true)
      invalidate()
    }, delayMs)
    return () => {
      globalThis.clearTimeout(timer)
    }
  }, [invalidate, reduceMotion, staggerIndex])

  const baseOpacity = revealed ? 0.42 : 0
  const opacity = hovered ? Math.max(baseOpacity, 0.72) : baseOpacity

  return (
    <mesh
      name={`neighbor-${neighbor.id}`}
      position={position}
      scale={revealed ? 1 : 0.001}
      onPointerOver={(event) => {
        if (!revealed) {
          return
        }
        event.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
        invalidate()
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
        invalidate()
      }}
    >
      <sphereGeometry args={[radius, 16, 12]} />
      <meshStandardMaterial
        color={depthKmToColor(depthKm)}
        metalness={0}
        opacity={opacity}
        roughness={0.82}
        transparent
        depthWrite={false}
      />
      {hovered && revealed ? (
        <Html
          position={[radius + 6, radius + 4, 0]}
          center={false}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          zIndexRange={[100, 0]}
        >
          <div className="neighbor-tooltip" role="tooltip">
            <p className="neighbor-tooltip__mag">
              M {formatMagnitude(neighbor.magnitude)}
            </p>
            <p className="neighbor-tooltip__place">
              {formatPlace(neighbor.place)}
            </p>
            <p className="neighbor-tooltip__depth">{formatDepth(depthKm)}</p>
          </div>
        </Html>
      ) : null}
    </mesh>
  )
}

/**
 * Vecinos FDSN alrededor del foco. El evento seleccionado no se repite aqui:
 * ya se filtra en el fetch (#73) y se vuelve a excluir por id por defensa.
 * Sin profundidad conocida no hay posicion honesta → se omite.
 * Cap de render: `SCENE_NEIGHBOR_RENDER_CAP` (alineado a `NEIGHBOR_LIMIT`).
 * Color = banda de profundidad (misma paleta que el mapa 2D); no tiempo.
 * Hover (puntero): tooltip mag / lugar / profundidad; un solo tooltip a la vez.
 */
export function NeighborMarkers({
  focusId,
  focusCoordinates,
  neighbors,
  reduceMotion,
}: NeighborMarkersProps) {
  const origin = toGeographic(focusCoordinates)

  const markers = []
  for (const neighbor of neighbors) {
    if (markers.length >= SCENE_NEIGHBOR_RENDER_CAP) {
      break
    }

    if (neighbor.id === focusId || neighbor.depthKm === null) {
      continue
    }

    const y = depthKmToY(neighbor.depthKm)
    if (y === null) {
      continue
    }

    const { x, z } = projectLatLonToLocalXZ(
      toGeographic(neighbor.coordinates),
      origin,
    )
    const radius = magnitudeToNeighborRadiusKm(neighbor.magnitude)
    const staggerIndex = markers.length

    markers.push(
      <NeighborSphere
        key={neighbor.id}
        neighbor={neighbor}
        position={[x, y, z]}
        radius={radius}
        depthKm={neighbor.depthKm}
        staggerIndex={staggerIndex}
        reduceMotion={reduceMotion}
      />,
    )
  }

  if (markers.length === 0) {
    return null
  }

  return <group name="neighbor-markers">{markers}</group>
}
