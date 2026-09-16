/**
 * Chequeo numérico del lenguaje de degradación ShakeMap (#100).
 */
import {
  deriveShakeMapContourUiState,
  isShakeMapContourGeometryUsable,
  shakeMapContourToggleHint,
} from '../src/map/shakeMapContourStatus.ts'
import {
  EMPTY_SHAKEMAP_FEATURE_COLLECTION,
  resolveShakeMapSourceData,
} from '../src/map/shakemapContours.ts'
import type { ShakeMapProductInfo } from '../shared/detail.ts'
import type { ShakeMapContoursResponse } from '../shared/shakemap.ts'

let failed = 0

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`ok - ${message}`)
    return
  }
  failed += 1
  console.error(`fail - ${message}`)
}

const none: ShakeMapProductInfo = { available: false, contourMiUrl: null }
const noUrl: ShakeMapProductInfo = { available: true, contourMiUrl: null }
const withUrl: ShakeMapProductInfo = {
  available: true,
  contourMiUrl: 'https://example.test/cont_mi.json',
}

const readyBody: ShakeMapContoursResponse = {
  fetchedAt: 1,
  eventId: 'us7000test',
  contourMiUrl: withUrl.contourMiUrl!,
  deferred: true,
  type: 'FeatureCollection',
  features: [],
}

assert(
  deriveShakeMapContourUiState(undefined, null) === null,
  'sin products → null',
)

assert(
  deriveShakeMapContourUiState(none, null)?.kind === 'absent',
  'sin ShakeMap → absent',
)

assert(
  deriveShakeMapContourUiState(noUrl, null)?.kind === 'absent_no_contours',
  'ShakeMap sin URL → absent_no_contours',
)

assert(
  deriveShakeMapContourUiState(withUrl, null)?.kind === 'loading',
  'URL sin query → loading',
)

assert(
  deriveShakeMapContourUiState(withUrl, {
    isPending: true,
    isFetching: true,
    isError: false,
    error: null,
    data: undefined,
  })?.kind === 'loading',
  'query pendiente → loading',
)

assert(
  deriveShakeMapContourUiState(withUrl, {
    isPending: false,
    isFetching: false,
    isError: true,
    error: new Error('upstream timeout'),
    data: undefined,
  })?.kind === 'error',
  'query error → error',
)

const ready = deriveShakeMapContourUiState(withUrl, {
  isPending: false,
  isFetching: false,
  isError: false,
  error: null,
  data: readyBody,
})
assert(
  ready?.kind === 'ready' && ready.deferred === true,
  'dato diferido → ready',
)
assert(ready?.featureCount === 0, 'ready expone featureCount')

assert(
  !isShakeMapContourGeometryUsable(null),
  'sin estado → geometría no usable',
)
assert(
  !isShakeMapContourGeometryUsable(ready ?? null),
  'ready diferido sin features → no usable',
)
assert(
  shakeMapContourToggleHint(null, false) === 'Selecciona un evento',
  'hint sin selección',
)
assert(
  shakeMapContourToggleHint({ kind: 'absent' }, true) ===
    'Sin ShakeMap en este evento',
  'hint absent',
)

const readyWithGeometry = deriveShakeMapContourUiState(withUrl, {
  isPending: false,
  isFetching: false,
  isError: false,
  error: null,
  data: {
    ...readyBody,
    deferred: false,
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
        properties: { mmi: 4 },
      },
    ],
  },
})
assert(
  isShakeMapContourGeometryUsable(readyWithGeometry ?? null),
  'ready con features → usable',
)
assert(
  shakeMapContourToggleHint(readyWithGeometry ?? null, true) ===
    'ShakeMap del evento',
  'hint con geometría',
)

assert(
  resolveShakeMapSourceData({
    selectedId: null,
    contoursEventId: 'us1',
    features: readyBody.features,
    isError: false,
  }) === EMPTY_SHAKEMAP_FEATURE_COLLECTION ||
    resolveShakeMapSourceData({
      selectedId: null,
      contoursEventId: 'us1',
      features: readyBody.features,
      isError: false,
    }).features.length === 0,
  'sin selección → source vacío',
)

assert(
  resolveShakeMapSourceData({
    selectedId: 'us-b',
    contoursEventId: 'us-a',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
        properties: { mmi: 3 },
      },
    ],
    isError: false,
  }).features.length === 0,
  'dato de otro id → source vacío',
)

assert(
  resolveShakeMapSourceData({
    selectedId: 'us-a',
    contoursEventId: 'us-a',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
        properties: { mmi: 3 },
      },
    ],
    isError: false,
  }).features.length === 1,
  'id coincidente → conserva features',
)

if (failed > 0) {
  console.error(`\n${failed} shakemap status check(s) failed`)
  process.exit(1)
}

console.log('\nAll shakemap status checks passed')
