import { create } from 'zustand'

import type { EarthquakeId } from '../../shared/earthquake.ts'

type EarthquakeSelectionState = {
  selectedId: EarthquakeId | null
  select: (id: EarthquakeId) => void
  clear: () => void
}

export const useEarthquakeSelection = create<EarthquakeSelectionState>(
  (set) => ({
    selectedId: null,
    select: (id) => set({ selectedId: id }),
    clear: () => set({ selectedId: null }),
  }),
)
