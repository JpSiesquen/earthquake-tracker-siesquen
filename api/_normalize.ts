import type {
  EarthquakeProductFlags,
  EarthquakeProducts,
} from '../shared/detail.js'
import type { EarthquakeSummary } from '../shared/earthquake.js'
import type { UsgsDetailFeature, UsgsFeature } from '../shared/usgs.js'

/** Feature USGS (summary o detail) → DTO interno del BFF. */
export function toEarthquakeSummary(
  feature: UsgsFeature | UsgsDetailFeature,
): EarthquakeSummary {
  const [longitude, latitude, depthKm] = feature.geometry.coordinates
  return {
    id: feature.id,
    magnitude: feature.properties.mag,
    place: feature.properties.place,
    timeMs: feature.properties.time,
    depthKm,
    coordinates: [longitude, latitude],
  }
}

const CONTOUR_MI_KEYS = [
  'download/cont_mi.json',
  'download/cont_mi.geojson',
] as const

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function preferredProductEntry(
  entries: unknown[] | undefined,
): Record<string, unknown> | null {
  if (!Array.isArray(entries) || entries.length === 0) return null

  let best: Record<string, unknown> | null = null
  let bestWeight = Number.NEGATIVE_INFINITY

  for (const entry of entries) {
    const record = asRecord(entry)
    if (!record) continue
    const weight =
      typeof record.preferredWeight === 'number' ? record.preferredWeight : 0
    if (!best || weight >= bestWeight) {
      best = record
      bestWeight = weight
    }
  }

  return best
}

function readContentUrl(
  contents: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!contents) return null
  const item = asRecord(contents[key])
  if (!item) return null
  return typeof item.url === 'string' && item.url.length > 0 ? item.url : null
}

function resolveContourMiUrl(
  contents: Record<string, unknown> | null,
): string | null {
  if (!contents) return null

  for (const key of CONTOUR_MI_KEYS) {
    const url = readContentUrl(contents, key)
    if (url) return url
  }

  for (const key of Object.keys(contents)) {
    if (!key.endsWith('cont_mi.json') && !key.endsWith('cont_mi.geojson')) {
      continue
    }
    const url = readContentUrl(contents, key)
    if (url) return url
  }

  return null
}

function readStringProp(
  properties: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!properties) return null
  const value = properties[key]
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function readNumberProp(
  properties: Record<string, unknown> | null,
  ...keys: string[]
): number | null {
  if (!properties) return null
  for (const key of keys) {
    const value = properties[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

/**
 * Products desde el detail USGS.
 * Claves: `shakemap`, `losspager` (→ pager), `dyfi`.
 * Resuelve URL de contornos MMI y metadatos PAGER/DYFI sin descargar payloads.
 */
export function toEarthquakeProducts(
  feature: UsgsDetailFeature,
): EarthquakeProducts {
  const products = feature.properties.products

  const shakemapEntry = preferredProductEntry(products?.shakemap)
  const pagerEntry = preferredProductEntry(products?.losspager)
  const dyfiEntry = preferredProductEntry(products?.dyfi)

  const shakemapContents = asRecord(shakemapEntry?.contents)
  const pagerProperties = asRecord(pagerEntry?.properties)
  const dyfiProperties = asRecord(dyfiEntry?.properties)

  return {
    shakemap: {
      available: shakemapEntry !== null,
      contourMiUrl: resolveContourMiUrl(shakemapContents),
    },
    pager: {
      available: pagerEntry !== null,
      alert: readStringProp(pagerProperties, 'alertlevel'),
    },
    dyfi: {
      available: dyfiEntry !== null,
      felt: readNumberProp(dyfiProperties, 'numResp', 'num-responses'),
      cdi: readNumberProp(dyfiProperties, 'maxmmi'),
    },
  }
}

/**
 * Solo flags booleanas (chips). Preferir `toEarthquakeProducts`.
 */
export function toProductFlags(
  feature: UsgsDetailFeature,
): EarthquakeProductFlags {
  const products = toEarthquakeProducts(feature)
  return {
    shakemap: products.shakemap.available,
    pager: products.pager.available,
    dyfi: products.dyfi.available,
  }
}
