import { z } from 'zod'

/**
 * Feature EMSC / Seismic Portal (`format=json`).
 * `geometry.coordinates[2]` a veces viene negativo; preferir `properties.depth`.
 */
export const emscFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().min(1),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: z.object({
    mag: z.number().nullable(),
    time: z.string().min(1),
    flynn_region: z.string().nullable().optional(),
    depth: z.number().nullable().optional(),
    unid: z.string().min(1).optional(),
    auth: z.string().nullable().optional(),
  }),
})

export type EmscFeature = z.infer<typeof emscFeatureSchema>

export const emscFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(emscFeatureSchema),
})

export type EmscFeatureCollection = z.infer<typeof emscFeatureCollectionSchema>

export const EMSC_ID_PREFIX = 'emsc.'

export function toEmscCatalogId(unid: string): string {
  return `${EMSC_ID_PREFIX}${unid}`
}

export function isEmscEventId(raw: string): boolean {
  return raw.startsWith(EMSC_ID_PREFIX) && raw.length > EMSC_ID_PREFIX.length
}

export function emscUnidFromCatalogId(id: string): string | null {
  if (!isEmscEventId(id)) return null
  return id.slice(EMSC_ID_PREFIX.length)
}
