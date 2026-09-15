import { useEffect, useRef } from 'react'

import type { EarthquakeSummary } from '../../shared/earthquake.ts'
import { useEarthquakeSelection } from '../store/earthquakeSelection.ts'

import { readEventIdFromSearch, writeEventIdToUrl } from './eventSearchParam.ts'

type UseEventDeepLinkOptions = {
  earthquakes: readonly EarthquakeSummary[] | undefined
  /** Se llama una vez al aplicar un deep link valido (p. ej. flyTo). */
  onDeepLinkSelect?: (earthquake: EarthquakeSummary) => void
}

/**
 * Sincroniza `?event=` ↔ `selectedId`.
 * Hidrata desde la URL cuando el catalogo esta listo; luego refleja la seleccion
 * con replaceState. Id ausente no rompe la app.
 */
export function useEventDeepLink({
  earthquakes,
  onDeepLinkSelect,
}: UseEventDeepLinkOptions): void {
  const select = useEarthquakeSelection((state) => state.select)
  const selectedId = useEarthquakeSelection((state) => state.selectedId)
  const hydratedRef = useRef(false)
  const onDeepLinkSelectRef = useRef(onDeepLinkSelect)

  useEffect(() => {
    onDeepLinkSelectRef.current = onDeepLinkSelect
  }, [onDeepLinkSelect])

  useEffect(() => {
    if (hydratedRef.current || earthquakes === undefined) return
    hydratedRef.current = true

    const urlEventId = readEventIdFromSearch()
    if (urlEventId === null) return

    const match = earthquakes.find((earthquake) => earthquake.id === urlEventId)
    if (!match) return

    select(match.id)
    onDeepLinkSelectRef.current?.(match)
  }, [earthquakes, select])

  useEffect(() => {
    if (!hydratedRef.current) return
    writeEventIdToUrl(selectedId)
  }, [selectedId])
}
