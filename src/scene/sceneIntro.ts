/** Ease-out cubico para la intro de Capa 2 (sin dependencia de Motion). */
export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return 1 - (1 - x) ** 3
}

/**
 * El conector crece tras un leve delay de camara; el hipocentro aparece al final.
 * `t` es progreso lineal 0..1 de la intro completa.
 */
export function connectorRevealProgress(t: number): number {
  return easeOutCubic(Math.min(1, Math.max(0, (t - 0.12) / 0.72)))
}

export function hypocenterRevealProgress(t: number): number {
  return easeOutCubic(Math.min(1, Math.max(0, (t - 0.78) / 0.22)))
}
