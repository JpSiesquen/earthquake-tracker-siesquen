/**
 * Verifica merge USGS+EMSC y schema EMSC (#290).
 * Uso: npm run test:emsc-merge
 */
import { mergeUsgsAndEmscCatalogs } from '../api/_mergeCatalog.ts'
import {
  emscFeatureCollectionSchema,
  emscFeatureSchema,
  emscUnidFromCatalogId,
  isEmscEventId,
  toEmscCatalogId,
} from '../shared/emsc.ts'
import type { EarthquakeSummary } from '../shared/earthquake.ts'

let failed = 0

function assert(name: string, ok: boolean, detail = '') {
  if (ok) {
    console.log(`ok - ${name}`)
  } else {
    failed += 1
    console.error(`fail - ${name}${detail ? `: ${detail}` : ''}`)
  }
}

function summary(
  partial: Partial<EarthquakeSummary> & Pick<EarthquakeSummary, 'id'>,
): EarthquakeSummary {
  return {
    magnitude: 4.1,
    place: 'test',
    timeMs: Date.parse('2026-09-18T14:42:40.0Z'),
    depthKm: 148.9,
    coordinates: [-69.34, -18.08],
    ...partial,
  }
}

const usgs = [
  summary({
    id: 'us7000test',
    timeMs: Date.parse('2026-09-18T14:42:30.0Z'),
    coordinates: [-69.4, -18.1],
    magnitude: 4.0,
  }),
]
const emscDup = summary({
  id: toEmscCatalogId('20260918_dup'),
  timeMs: Date.parse('2026-09-18T14:42:50.0Z'),
  coordinates: [-69.35, -18.09],
  magnitude: 4.2,
})
const emscOnly = summary({
  id: toEmscCatalogId('20260918_0000210'),
  place: 'TARAPACA, CHILE (EMSC/CSN)',
  timeMs: Date.parse('2026-09-18T16:00:00.0Z'),
  coordinates: [-70.1, -20.2],
  magnitude: 4.1,
})

const merged = mergeUsgsAndEmscCatalogs(usgs, [emscDup, emscOnly])
assert(
  'Dedup descarta EMSC cercano a USGS',
  merged.length === 2 && merged.every((e) => e.id !== emscDup.id),
)
assert(
  'EMSC solo-en-EMSC entra al catalogo',
  merged.some((e) => e.id === emscOnly.id),
)
assert(
  'USGS se conserva',
  merged.some((e) => e.id === 'us7000test'),
)
assert(
  'Orden por tiempo descendente',
  merged[0]?.id === emscOnly.id && merged[1]?.id === 'us7000test',
)

const emptyMerge = mergeUsgsAndEmscCatalogs(usgs, [])
assert('EMSC vacio no altera USGS', emptyMerge.length === 1)

assert('Prefijo emsc.*', isEmscEventId('emsc.20260918_0000210'))
assert('No confunde USGS', !isEmscEventId('us7000pn9s'))
assert(
  'Unid desde catalog id',
  emscUnidFromCatalogId('emsc.20260918_0000210') === '20260918_0000210',
)

const sampleFeature = {
  type: 'Feature',
  id: '20260918_0000210',
  geometry: {
    type: 'Point',
    coordinates: [-69.34, -18.08, -148.9],
  },
  properties: {
    mag: 4.1,
    time: '2026-09-18T14:42:40.0Z',
    flynn_region: 'TARAPACA, CHILE',
    depth: 148.9,
    unid: '20260918_0000210',
    auth: 'CSN',
  },
}
assert(
  'Feature EMSC valida',
  emscFeatureSchema.safeParse(sampleFeature).success,
)
assert(
  'FeatureCollection EMSC valida',
  emscFeatureCollectionSchema.safeParse({
    type: 'FeatureCollection',
    features: [sampleFeature],
  }).success,
)

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log('\nAll emsc-merge checks passed')
