import { z } from 'zod'

/**
 * Feature GeoJSON de un evento USGS (feed summary).
 * Solo los campos que el BFF necesita para el DTO.
 */
export const usgsFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().min(1),
  geometry: z.object({
    type: z.literal('Point'),
    /** [longitud, latitud, profundidadKm] */
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: z.object({
    mag: z.number().nullable(),
    place: z.string().nullable(),
    time: z.number(),
  }),
})

export type UsgsFeature = z.infer<typeof usgsFeatureSchema>

/**
 * FeatureCollection del feed USGS summary (day/week).
 * `metadata.count` debe coincidir con `features.length`.
 */
export const usgsFeatureCollectionSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    metadata: z.object({
      count: z.number().int().nonnegative(),
    }),
    features: z.array(usgsFeatureSchema),
  })
  .superRefine((data, ctx) => {
    if (data.metadata.count !== data.features.length) {
      ctx.addIssue({
        code: 'custom',
        message: `metadata.count (${data.metadata.count}) !== features.length (${data.features.length})`,
        path: ['metadata', 'count'],
      })
    }
  })

export type UsgsFeatureCollection = z.infer<typeof usgsFeatureCollectionSchema>

/**
 * Feature de detail USGS (feed `/detail/{id}.geojson`).
 * Extiende el summary: url de event page + mapa `products` (existencia tipada;
 * flags concretas en #69).
 */
export const usgsDetailFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().min(1),
  geometry: z.object({
    type: z.literal('Point'),
    /** [longitud, latitud, profundidadKm] */
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: z.object({
    mag: z.number().nullable(),
    place: z.string().nullable(),
    time: z.number(),
    url: z.string().nullable().optional(),
    /** productType → versiones; no se exige el arbol interno completo */
    products: z.record(z.string(), z.array(z.unknown())).optional(),
  }),
})

export type UsgsDetailFeature = z.infer<typeof usgsDetailFeatureSchema>
