/**
 * Schema mínimo de contornos ShakeMap (#101).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  usgsShakeMapContourCollectionSchema,
  toShakeMapContourFeatures,
  isAllowedUsgsProductUrl,
} from '../shared/shakemap.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

let failed = 0

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`ok - ${message}`)
    return
  }
  failed += 1
  console.error(`fail - ${message}`)
}

function loadJson(name: string): unknown {
  return JSON.parse(readFileSync(join(root, 'fixtures', name), 'utf8'))
}

const valid = usgsShakeMapContourCollectionSchema.safeParse(
  loadJson('shakemap-cont-mi-valid.json'),
)
assert(valid.success, 'cont_mi valido pasa schema')

if (valid.success) {
  const features = toShakeMapContourFeatures(valid.data)
  assert(features.length === 2, 'normaliza 2 features')
  assert(features[0]?.properties.mmi === 2.5, 'mmi desde properties.value')
  assert(
    features[0]?.geometry.type === 'MultiLineString',
    'conserva MultiLineString',
  )
}

const invalid = usgsShakeMapContourCollectionSchema.safeParse(
  loadJson('shakemap-cont-mi-invalid.json'),
)
assert(!invalid.success, 'cont_mi invalido (Point sin value) falla schema')

const empty = usgsShakeMapContourCollectionSchema.safeParse({
  type: 'FeatureCollection',
  features: [],
})
assert(empty.success, 'FeatureCollection vacia pasa schema')

assert(
  isAllowedUsgsProductUrl(
    'https://earthquake.usgs.gov/product/shakemap/x/download/cont_mi.json',
  ),
  'URL USGS permitida',
)
assert(
  !isAllowedUsgsProductUrl('https://evil.example/cont_mi.json'),
  'URL externa rechazada',
)
assert(
  !isAllowedUsgsProductUrl('http://earthquake.usgs.gov/cont_mi.json'),
  'http rechazado',
)

if (failed > 0) {
  console.error(`\n${failed} shakemap contour check(s) failed`)
  process.exit(1)
}

console.log('\nAll shakemap contour checks passed')
