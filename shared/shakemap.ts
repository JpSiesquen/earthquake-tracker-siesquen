import { z } from 'zod'

/**
 * Contornos MMI vía BFF (`GET /api/earthquakes/:id/shakemap`).
 *
 * Schema mínimo usable (#101): geometría de línea/polígono + valor MMI.
 * No es el PDF completo de ShakeMap.
 */

const positionSchema = z.array(z.number()).min(2)
const lineStringCoordsSchema = z.array(positionSchema).min(2)
const polygonCoordsSchema = z.array(lineStringCoordsSchema).min(1)

export const shakeMapContourGeometrySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('LineString'),
    coordinates: lineStringCoordsSchema,
  }),
  z.object({
    type: z.literal('MultiLineString'),
    coordinates: z.array(lineStringCoordsSchema).min(1),
  }),
  z.object({
    type: z.literal('Polygon'),
    coordinates: polygonCoordsSchema,
  }),
  z.object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(polygonCoordsSchema).min(1),
  }),
])

/**
 * Feature crudo USGS (`cont_mi.json`): MMI en `properties.value`.
 */
export const usgsShakeMapContourFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: shakeMapContourGeometrySchema,
  properties: z
    .object({
      value: z.number().finite(),
    })
    .passthrough(),
})

export const usgsShakeMapContourCollectionSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    features: z.array(usgsShakeMapContourFeatureSchema),
  })
  .passthrough()

export type UsgsShakeMapContourCollection = z.infer<
  typeof usgsShakeMapContourCollectionSchema
>

/** Feature normalizado que consume el mapa (#102). */
export type ShakeMapContourFeature = {
  type: 'Feature'
  geometry: z.infer<typeof shakeMapContourGeometrySchema>
  properties: {
    /** Intensidad MMI (de `properties.value` USGS) */
    mmi: number
  }
}

export type ShakeMapContoursResponse = {
  fetchedAt: number
  contourMiUrl: string
  /**
   * true solo en stubs previos (#100). Tras #101 la descarga ya corrió:
   * siempre `false` en respuestas 200.
   */
  deferred: boolean
  type: 'FeatureCollection'
  features: ShakeMapContourFeature[]
}

/**
 * Solo HTTPS hacia hosts USGS. Evita open-proxy si alguien inyecta URL.
 */
export function isAllowedUsgsProductUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase()
    return (
      host === 'earthquake.usgs.gov' || host.endsWith('.earthquake.usgs.gov')
    )
  } catch {
    return false
  }
}

/**
 * Normaliza features USGS → DTO con `mmi` explícito.
 */
export function toShakeMapContourFeatures(
  collection: UsgsShakeMapContourCollection,
): ShakeMapContourFeature[] {
  return collection.features.map((feature) => ({
    type: 'Feature' as const,
    geometry: feature.geometry,
    properties: {
      mmi: feature.properties.value,
    },
  }))
}
