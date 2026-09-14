#!/usr/bin/env node
/**
 * Blocks commits that stage sensitive paths or secret-like content.
 * Second barrier after .gitignore (git add -f bypasses ignore).
 */

import { execSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

const RUTAS_PROHIBIDAS = [
  {
    patron: /^\.env($|\.)/,
    motivo: 'variables de entorno (puede contener tokens)',
  },
  { patron: /^\.vercel\//, motivo: 'credenciales de despliegue' },
  {
    patron: /\.local\.(md|json)$/,
    motivo: 'configuracion personal, no del equipo',
  },
  { patron: /^PLAN\.md$/, motivo: 'documento de trabajo interno' },
  { patron: /^Notas\//, motivo: 'notas personales de estudio' },
  {
    patron: /^node_modules\//,
    motivo: 'dependencias: se instalan, no se commitean',
  },
  { patron: /^dist\//, motivo: 'build generado' },
]

const PATRONES_SECRETO = [
  { patron: /\bghp_[A-Za-z0-9]{36}\b/, nombre: 'token de GitHub (classic)' },
  {
    patron: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/,
    nombre: 'token de GitHub (fine-grained)',
  },
  { patron: /\bsk-[A-Za-z0-9]{32,}\b/, nombre: 'clave de API tipo OpenAI' },
  { patron: /\bAKIA[0-9A-Z]{16}\b/, nombre: 'clave de acceso de AWS' },
  { patron: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, nombre: 'clave privada' },
]

const BINARIOS =
  /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|pdf|zip)$/i
const TAMANO_MAXIMO = 512 * 1024

function archivosEnStaging() {
  const salida = execSync('git diff --cached --name-only --diff-filter=ACM', {
    encoding: 'utf8',
  })
  return salida.split('\n').filter(Boolean)
}

const problemas = []

for (const archivo of archivosEnStaging()) {
  const ruta = archivo.replace(/\\/g, '/')

  const prohibida = RUTAS_PROHIBIDAS.find((r) => r.patron.test(ruta))
  if (prohibida) {
    problemas.push({
      archivo: ruta,
      causa: `archivo prohibido - ${prohibida.motivo}`,
    })
    continue
  }

  if (BINARIOS.test(ruta)) continue
  try {
    if (statSync(ruta).size > TAMANO_MAXIMO) continue
    const contenido = readFileSync(ruta, 'utf8')
    for (const { patron, nombre } of PATRONES_SECRETO) {
      if (patron.test(contenido)) {
        problemas.push({
          archivo: ruta,
          causa: `posible ${nombre} en el contenido`,
        })
        break
      }
    }
  } catch {
    // Staging race: ignore
  }
}

if (problemas.length === 0) process.exit(0)

console.error('\n  COMMIT BLOQUEADO - contenido sensible detectado\n')
for (const { archivo, causa } of problemas) {
  console.error(`   ${archivo}`)
  console.error(`     ${causa}\n`)
}
console.error('  Este repositorio es publico. Un secreto subido NO se deshace:')
console.error(
  '  borrarlo despues no lo saca del historial, y hay que rotarlo.\n',
)
console.error('  Para sacar un archivo del commit:')
console.error('     git restore --staged <archivo>\n')

process.exit(1)
