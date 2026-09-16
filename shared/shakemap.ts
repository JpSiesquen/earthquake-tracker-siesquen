/**
 * Contornos MMI vía BFF (`GET /api/earthquakes/:id/shakemap`).
 *
 * #100 cierra el contrato de UI + stub sin descargar USGS.
 * #101 rellena `features` con el GeoJSON validado.
 */
export type ShakeMapContoursResponse = {
  fetchedAt: number
  /** URL de contornos resuelta en el detail (#99) */
  contourMiUrl: string
  /**
   * true = URL conocida pero la descarga/parse USGS aún no corre (#101).
   * El cliente puede marcar "listo" sin pintar geometría (#102).
   */
  deferred: boolean
  type: 'FeatureCollection'
  features: unknown[]
}
