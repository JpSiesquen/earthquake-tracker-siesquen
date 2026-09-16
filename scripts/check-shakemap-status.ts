/**
 * Chequeo numérico del lenguaje de degradación ShakeMap (#100).
 */
import { deriveShakeMapContourUiState } from '../src/map/shakeMapContourStatus.ts'
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

if (failed > 0) {
  console.error(`\n${failed} shakemap status check(s) failed`)
  process.exit(1)
}

console.log('\nAll shakemap status checks passed')
