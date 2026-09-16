/**
 * Verifica schemas Zod del feed USGS (#42).
 * Uso: npm run test:usgs-schema
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  usgsDetailFeatureSchema,
  usgsFeatureCollectionSchema,
  usgsFeatureSchema,
} from '../shared/usgs.ts'
import { toProductFlags } from '../api/_normalize.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadJson(rel: string): unknown {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'))
}

let failed = 0

function assert(name: string, ok: boolean, detail = '') {
  if (ok) {
    console.log(`ok - ${name}`)
  } else {
    failed += 1
    console.error(`fail - ${name}${detail ? `: ${detail}` : ''}`)
  }
}

const validFc = loadJson('fixtures/usgs-featurecollection-valid.json')
assert(
  'FeatureCollection valida pasa',
  usgsFeatureCollectionSchema.safeParse(validFc).success,
)

const badCount = loadJson('fixtures/usgs-featurecollection-bad-count.json')
assert(
  'FeatureCollection con count incoherente falla',
  !usgsFeatureCollectionSchema.safeParse(badCount).success,
)

const validFeature = (validFc as { features: unknown[] }).features[0]
assert('Feature valida pasa', usgsFeatureSchema.safeParse(validFeature).success)

const invalidFeature = loadJson('fixtures/usgs-feature-invalid.json')
assert(
  'Feature invalida falla',
  !usgsFeatureSchema.safeParse(invalidFeature).success,
)

const validDetail = loadJson('fixtures/usgs-detail-valid.json')
const parsedValidDetail = usgsDetailFeatureSchema.safeParse(validDetail)
assert('Detail Feature valida pasa', parsedValidDetail.success)

if (parsedValidDetail.success) {
  const flags = toProductFlags(parsedValidDetail.data)
  assert(
    'Detail con ShakeMap/PAGER/DYFI reporta flags true',
    flags.shakemap && flags.pager && flags.dyfi,
  )
}

const invalidDetail = loadJson('fixtures/usgs-detail-invalid.json')
assert(
  'Detail Feature invalida falla',
  !usgsDetailFeatureSchema.safeParse(invalidDetail).success,
)

const noProductsDetail = {
  type: 'Feature',
  id: 'us0000none',
  geometry: { type: 'Point', coordinates: [-70, -30, 40] },
  properties: {
    mag: 5.1,
    place: 'Sin products',
    time: 1_700_000_000_000,
    url: null,
  },
}
const parsedNoProducts = usgsDetailFeatureSchema.safeParse(noProductsDetail)
assert('Detail sin products pasa schema', parsedNoProducts.success)
if (parsedNoProducts.success) {
  const flags = toProductFlags(parsedNoProducts.data)
  assert(
    'Detail sin products reporta flags false',
    !flags.shakemap && !flags.pager && !flags.dyfi,
  )
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}

console.log('\nAll usgs schema checks passed')
