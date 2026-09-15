/** Ventana del feed USGS all_*.geojson */
export type CatalogWindow = 'day' | 'week'

export function isCatalogWindow(value: string): value is CatalogWindow {
  return value === 'day' || value === 'week'
}
