/**
 * Verifica la proyeccion geografica local de Capa 2 (#85).
 * Uso: npm run test:local-coordinates
 */
import { projectLatLonToLocalXZ } from '../src/geo/localCoordinates.ts'

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

const equator = { latitude: 0, longitude: 0 }
const origin = projectLatLonToLocalXZ(equator, equator)
assertClose('el epicentro ocupa X=0', origin.x, 0)
assertClose('el epicentro ocupa Z=0', origin.z, 0)

const north = projectLatLonToLocalXZ({ latitude: 1, longitude: 0 }, equator)
assertClose('un grado norte conserva X=0', north.x, 0)
assertClose(
  'un grado norte avanza sobre -Z',
  north.z,
  -KILOMETRES_PER_EQUATORIAL_DEGREE,
)

const eastAtSixty = projectLatLonToLocalXZ(
  { latitude: 60, longitude: 1 },
  { latitude: 60, longitude: 0 },
)
assertClose(
  'un grado este a 60 grados avanza sobre +X',
  eastAtSixty.x,
  KILOMETRES_PER_EQUATORIAL_DEGREE / 2,
)
assertClose('un grado este conserva Z=0', eastAtSixty.z, 0)

const acrossAntimeridian = projectLatLonToLocalXZ(
  { latitude: 0, longitude: -179.9 },
  { latitude: 0, longitude: 179.9 },
)
assertClose(
  'el antimeridiano usa el recorrido local corto hacia el este',
  acrossAntimeridian.x,
  KILOMETRES_PER_EQUATORIAL_DEGREE * 0.2,
)

if (failed > 0) {
  process.exitCode = 1
} else {
  console.log('\nAll local coordinate checks passed')
}
