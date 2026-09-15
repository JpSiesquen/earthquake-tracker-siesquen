import type { MapCameraPreset } from './mapPresets.ts'
import { MAP_PRESETS } from './mapPresets.ts'

import './MapPresets.css'

type MapPresetsProps = {
  onApplyPreset: (preset: MapCameraPreset) => void
}

export function MapPresets({ onApplyPreset }: MapPresetsProps) {
  return (
    <section className="map-presets" aria-label="Presets de vista">
      <p className="map-presets__label">Vista</p>
      <div className="map-presets__actions">
        {MAP_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  )
}
