export type MapLayerVisibility = {
  earthquakes: boolean
  plates: boolean
  heatmap: boolean
}

type LayerControlProps = {
  visibility: MapLayerVisibility
  onVisibilityChange: (
    layer: keyof MapLayerVisibility,
    visible: boolean,
  ) => void
}

const LAYER_OPTIONS = [
  {
    id: 'earthquakes',
    label: 'Sismos',
    description: 'Eventos individuales',
  },
  {
    id: 'plates',
    label: 'Placas tectónicas',
    description: 'Límites PB2002',
  },
  {
    id: 'heatmap',
    label: 'Densidad sísmica',
    description: 'Concentración por magnitud',
  },
] as const

export function LayerControl({
  visibility,
  onVisibilityChange,
}: LayerControlProps) {
  return (
    <fieldset className="layer-control">
      <legend>Capas</legend>
      <div className="layer-control__options">
        {LAYER_OPTIONS.map((option) => (
          <label className="layer-control__option" key={option.id}>
            <input
              type="checkbox"
              checked={visibility[option.id]}
              onChange={(event) =>
                onVisibilityChange(option.id, event.target.checked)
              }
            />
            <span
              className={`layer-control__sample layer-control__sample--${option.id}`}
              aria-hidden="true"
            />
            <span className="layer-control__copy">
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
