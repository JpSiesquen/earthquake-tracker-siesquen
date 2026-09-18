import {
  buildDemGridIndices,
  localKmToLonLat,
  lonLatToTile,
  lonLatToTileUv,
  terrariumRgbToMeters,
  TERRARIUM_TILE_URL,
  type DemGrid,
} from './terrariumMath.ts'

export const DEM_EXTENT_KM = 220
export const DEM_RESOLUTION = 49
export const DEM_ZOOM = 9
/** Exageracion solo del relieve (independiente del 1.5x de profundidad). */
export const DEM_TERRAIN_EXAGGERATION = 2.2
export const DEM_FETCH_TIMEOUT_MS = 8_000

type TilePixels = {
  width: number
  height: number
  data: Uint8ClampedArray
}

type FetchLocalDemArgs = {
  originLon: number
  originLat: number
  signal?: AbortSignal
}

function mergeAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort()
      return controller.signal
    }
    signal.addEventListener(
      'abort',
      () => {
        controller.abort()
      },
      { once: true },
    )
  }
  return controller.signal
}

function tileUrl(z: number, x: number, y: number): string {
  return `${TERRARIUM_TILE_URL}/${z}/${x}/${y}.png`
}

async function decodeTile(
  z: number,
  x: number,
  y: number,
  signal: AbortSignal,
): Promise<TilePixels> {
  const response = await fetch(tileUrl(z, x, y), { signal })
  if (!response.ok) {
    throw new Error(`Terrarium HTTP ${response.status}`)
  }
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas 2D unavailable for DEM decode')
  }
  ctx.drawImage(bitmap, 0, 0)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  bitmap.close()
  return {
    width: image.width,
    height: image.height,
    data: image.data,
  }
}

function sampleElevationMeters(tile: TilePixels, u: number, v: number): number {
  const px = Math.min(tile.width - 1, Math.max(0, Math.floor(u * tile.width)))
  const py = Math.min(tile.height - 1, Math.max(0, Math.floor(v * tile.height)))
  const i = (py * tile.width + px) * 4
  const meters = terrariumRgbToMeters(
    tile.data[i]!,
    tile.data[i + 1]!,
    tile.data[i + 2]!,
  )
  // Oceanos / batimetria: plano de costa (lab), no fosa.
  return Math.max(0, meters)
}

/**
 * Descarga tiles Terrarium y arma una malla local en km.
 * Lanza si timeout, HTTP error o decode falla → el caller cae al plano.
 */
export async function fetchLocalDemGrid({
  originLon,
  originLat,
  signal,
}: FetchLocalDemArgs): Promise<DemGrid> {
  const timeout = AbortSignal.timeout(DEM_FETCH_TIMEOUT_MS)
  const combined = mergeAbortSignals(
    signal !== undefined ? [signal, timeout] : [timeout],
  )

  const half = DEM_EXTENT_KM / 2
  const step = DEM_EXTENT_KM / (DEM_RESOLUTION - 1)
  const tileKeys = new Set<string>()
  const samples: { x: number; z: number; lon: number; lat: number }[] = []

  for (let row = 0; row < DEM_RESOLUTION; row += 1) {
    for (let col = 0; col < DEM_RESOLUTION; col += 1) {
      const x = -half + col * step
      const z = -half + row * step
      const { longitude, latitude } = localKmToLonLat(
        x,
        z,
        originLon,
        originLat,
      )
      const tile = lonLatToTile(longitude, latitude, DEM_ZOOM)
      tileKeys.add(`${tile.z}/${tile.x}/${tile.y}`)
      samples.push({ x, z, lon: longitude, lat: latitude })
    }
  }

  const tiles = new Map<string, TilePixels>()
  await Promise.all(
    [...tileKeys].map(async (key) => {
      const [z, x, y] = key.split('/').map(Number) as [number, number, number]
      tiles.set(key, await decodeTile(z, x, y, combined))
    }),
  )

  const positions = new Float32Array(DEM_RESOLUTION * DEM_RESOLUTION * 3)
  let cursor = 0
  for (const sample of samples) {
    const tileId = lonLatToTile(sample.lon, sample.lat, DEM_ZOOM)
    const key = `${tileId.z}/${tileId.x}/${tileId.y}`
    const tile = tiles.get(key)
    if (!tile) {
      throw new Error(`Missing DEM tile ${key}`)
    }
    const { u, v } = lonLatToTileUv(
      sample.lon,
      sample.lat,
      DEM_ZOOM,
      tileId.x,
      tileId.y,
    )
    const elevKm =
      (sampleElevationMeters(tile, u, v) / 1000) * DEM_TERRAIN_EXAGGERATION
    positions[cursor++] = sample.x
    positions[cursor++] = elevKm
    positions[cursor++] = sample.z
  }

  return {
    positions,
    indices: buildDemGridIndices(DEM_RESOLUTION),
    resolution: DEM_RESOLUTION,
    extentKm: DEM_EXTENT_KM,
  }
}
