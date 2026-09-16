/**
 * Regresión barata del convenio geo de Capa 2 (#85, #86, #97).
 *
 * Casos documentados:
 * - origen (0,0) → X=0, Z=0
 * - offset norte → -Z; offset este → +X (escala equirectangular)
 * - profundidad positiva → Y negativo con exageración 1.5x; null se excluye
 * - bandas de color por profundidad (mismas umbrales que el mapa 2D)
 *
 * Uso: npm run test:local-coordinates
 * CI: job `verificar` en `.github/workflows/ci.yml`
 */
import {
  depthKmToBand,
  DEPTH_COLORS,
  INTERMEDIATE_MAX_DEPTH_KM,
  SHALLOW_MAX_DEPTH_KM,
} from '../src/geo/depthBands.ts'
import {
  DEFAULT_VERTICAL_EXAGGERATION,
  depthKmToY,
  projectLatLonToLocalXZ,
} from '../src/geo/localCoordinates.ts'

const KILOMETRES_PER_EQUATORIAL_DEGREE = 111.195

let failed = 0

function assertClose(name: string, actual: number, expected: number) {
  const tolerance = 0.001
  const ok = Math.abs(actual - expected) <= tolerance

  if (ok) {
    console.log(`ok - ${name}`)
    return
  }

  failed += 1
  console.error(`fail - ${name}: esperado ${expected}, recibido ${actual}`)
}

function assertEqual(name: string, actual: unknown, expected: unknown) {
  if (actual === expected) {
    console.log(`ok - ${name}`)
    return
  }

  failed += 1
  console.error(
    `fail - ${name}: esperado ${String(expected)}, recibido ${String(actual)}`,
  )
}

function assertThrows(name: string, action: () => unknown) {
  try {
    action()
    failed += 1
    console.error(`fail - ${name}: se esperaba RangeError`)
  } catch (error) {
    if (error instanceof RangeError) {
      console.log(`ok - ${name}`)
      return
    }

    failed += 1
    console.error(`fail - ${name}: error inesperado`)
  }
}

// --- lat/lon → XZ locales ---
const equator = { latitude: 0, longitude: 0 }
const origin = projectLatLonToLocalXZ(equator, equator)
assertClose('origen (0,0) ocupa X=0', origin.x, 0)
assertClose('origen (0,0) ocupa Z=0', origin.z, 0)

const north = projectLatLonToLocalXZ({ latitude: 1, longitude: 0 }, equator)
assertClose('offset norte conserva X=0', north.x, 0)
assertClose(
  'offset norte avanza sobre -Z',
  north.z,
  -KILOMETRES_PER_EQUATORIAL_DEGREE,
)

const eastAtSixty = projectLatLonToLocalXZ(
  { latitude: 60, longitude: 1 },
  { latitude: 60, longitude: 0 },
)
assertClose(
  'offset este a 60 grados avanza sobre +X',
  eastAtSixty.x,
  KILOMETRES_PER_EQUATORIAL_DEGREE / 2,
)
assertClose('offset este conserva Z=0', eastAtSixty.z, 0)

const acrossAntimeridian = projectLatLonToLocalXZ(
  { latitude: 0, longitude: -179.9 },
  { latitude: 0, longitude: 179.9 },
)
assertClose(
  'el antimeridiano usa el recorrido local corto hacia el este',
  acrossAntimeridian.x,
  KILOMETRES_PER_EQUATORIAL_DEGREE * 0.2,
)

// --- profundidad → Y ---
assertClose('la superficie conserva Y=0', depthKmToY(0) ?? NaN, 0)
assertClose(
  'depth→Y: positiva avanza sobre -Y con exageracion 1.5x',
  depthKmToY(10) ?? NaN,
  -10 * DEFAULT_VERTICAL_EXAGGERATION,
)
assertClose(
  'depth→Y: mayor profundidad aumenta |Y|',
  depthKmToY(40) ?? NaN,
  -40 * DEFAULT_VERTICAL_EXAGGERATION,
)
assertClose(
  'depth→Y: sobre el nivel de referencia avanza sobre +Y',
  depthKmToY(-2, 2) ?? NaN,
  4,
)

if (depthKmToY(null) === null) {
  console.log('ok - depth→Y: profundidad desconocida se excluye')
} else {
  failed += 1
  console.error('fail - la profundidad desconocida debe devolver null')
}

assertThrows('la exageracion cero se rechaza', () => depthKmToY(10, 0))
assertThrows('la profundidad no finita se rechaza', () => depthKmToY(NaN))

// --- bandas de color (mapa 2D + vecinos 3D) ---
assertEqual(
  'banda shallow bajo el umbral',
  depthKmToBand(SHALLOW_MAX_DEPTH_KM - 1),
  'shallow',
)
assertEqual(
  'banda intermediate en el umbral shallow',
  depthKmToBand(SHALLOW_MAX_DEPTH_KM),
  'intermediate',
)
assertEqual(
  'banda deep en el umbral intermediate',
  depthKmToBand(INTERMEDIATE_MAX_DEPTH_KM),
  'deep',
)
assertEqual('banda unknown sin dato', depthKmToBand(null), 'unknown')
assertEqual('color shallow alineado al mapa', DEPTH_COLORS.shallow, '#b86b25')

if (failed > 0) {
  process.exitCode = 1
} else {
  console.log('\nAll local coordinate checks passed')
}
