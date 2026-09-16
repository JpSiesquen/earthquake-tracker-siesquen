import type { EarthquakeSummary } from '../../shared/earthquake.ts'

import './MagnitudeTimeChart.css'

type MagnitudeTimeChartProps = {
  neighbors: readonly EarthquakeSummary[]
  focus: EarthquakeSummary | undefined
  isLoading: boolean
  isError: boolean
}

type PlotPoint = {
  id: string
  timeMs: number
  magnitude: number
  isFocus: boolean
}

const WIDTH = 280
const HEIGHT = 140
const PAD = { top: 12, right: 12, bottom: 28, left: 32 }

const DISCLAIMER =
  'Vista exploratoria del conjunto actual de vecinos. No es un pronóstico ni un modelo de aftershocks.'

function collectPoints(
  neighbors: readonly EarthquakeSummary[],
  focus: EarthquakeSummary | undefined,
): PlotPoint[] {
  const points: PlotPoint[] = []

  for (const quake of neighbors) {
    if (quake.magnitude === null || !Number.isFinite(quake.magnitude)) continue
    points.push({
      id: quake.id,
      timeMs: quake.timeMs,
      magnitude: quake.magnitude,
      isFocus: false,
    })
  }

  if (
    focus &&
    focus.magnitude !== null &&
    Number.isFinite(focus.magnitude) &&
    !points.some((point) => point.id === focus.id)
  ) {
    points.push({
      id: focus.id,
      timeMs: focus.timeMs,
      magnitude: focus.magnitude,
      isFocus: true,
    })
  } else if (focus) {
    const existing = points.find((point) => point.id === focus.id)
    if (existing) existing.isFocus = true
  }

  return points.sort((a, b) => a.timeMs - b.timeMs)
}

function formatUtcTick(timeMs: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(new Date(timeMs))
}

/**
 * Vista exploratoria M–t de vecinos FDSN (#106 / #234).
 * El heading vive en la sección de Event3DPage; aquí solo el gráfico o el estado.
 * No es pronóstico ni modelo de aftershocks.
 */
export function MagnitudeTimeChart({
  neighbors,
  focus,
  isLoading,
  isError,
}: MagnitudeTimeChartProps) {
  const points = collectPoints(neighbors, focus)

  if (isError) {
    return (
      <div className="mt-chart" role="status">
        <p className="mt-chart__empty">
          Vecinos no disponibles para el gráfico.
        </p>
      </div>
    )
  }

  if (isLoading && points.length === 0) {
    return (
      <div className="mt-chart" role="status" aria-busy="true">
        <p className="mt-chart__empty">Cargando vecinos…</p>
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="mt-chart" role="status">
        <p className="mt-chart__empty">
          Sin vecinos con magnitud para graficar.
        </p>
      </div>
    )
  }

  const times = points.map((point) => point.timeMs)
  const mags = points.map((point) => point.magnitude)
  const minT = Math.min(...times)
  const maxT = Math.max(...times)
  const minM = Math.min(...mags)
  const maxM = Math.max(...mags)
  const spanT = Math.max(maxT - minT, 1)
  const spanM = Math.max(maxM - minM, 0.5)
  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom

  const coords = points.map((point) => {
    const x = PAD.left + ((point.timeMs - minT) / spanT) * innerW
    const y = PAD.top + (1 - (point.magnitude - minM) / spanM) * innerH
    return { ...point, x, y }
  })

  const linePath = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="mt-chart">
      <svg
        className="mt-chart__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Gráfico magnitud versus tiempo UTC de vecinos FDSN"
      >
        <line
          className="mt-chart__axis"
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={HEIGHT - PAD.bottom}
        />
        <line
          className="mt-chart__axis"
          x1={PAD.left}
          y1={HEIGHT - PAD.bottom}
          x2={WIDTH - PAD.right}
          y2={HEIGHT - PAD.bottom}
        />
        <text
          className="mt-chart__label"
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
        >
          {maxM.toFixed(1)}
        </text>
        <text
          className="mt-chart__label"
          x={PAD.left - 6}
          y={HEIGHT - PAD.bottom}
          textAnchor="end"
        >
          {minM.toFixed(1)}
        </text>
        <text
          className="mt-chart__label"
          x={PAD.left}
          y={HEIGHT - 8}
          textAnchor="start"
        >
          {formatUtcTick(minT)}
        </text>
        <text
          className="mt-chart__label"
          x={WIDTH - PAD.right}
          y={HEIGHT - 8}
          textAnchor="end"
        >
          {formatUtcTick(maxT)} UTC
        </text>
        {coords.length > 1 ? (
          <path className="mt-chart__line" d={linePath} fill="none" />
        ) : null}
        {coords.map((point) => (
          <circle
            key={point.id}
            className={
              point.isFocus
                ? 'mt-chart__point mt-chart__point--focus'
                : 'mt-chart__point'
            }
            cx={point.x}
            cy={point.y}
            r={point.isFocus ? 4 : 3}
          >
            <title>{`M${point.magnitude.toFixed(1)} · ${formatUtcTick(point.timeMs)} UTC`}</title>
          </circle>
        ))}
      </svg>
      <p className="mt-chart__disclaimer">{DISCLAIMER}</p>
    </div>
  )
}
