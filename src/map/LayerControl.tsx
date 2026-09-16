export type MapLayerVisibility = {
  earthquakes: boolean
  plates: boolean
  heatmap: boolean
  shakemap: boolean
}

export type ShakeMapLayerToggle = {
  /** Hay geometría MMI usable; si false el checkbox va off + disabled */
  enabled: boolean
  /** Descripción / razón corta bajo la etiqueta */
  hint: string
}

type LayerControlProps = {
  visibility: MapLayerVisibility
  onVisibilityChange: (
    layer: keyof MapLayerVisibility,
    visible: boolean,
  ) => void
  shakemapToggle: ShakeMapLayerToggle
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
  {
    id: 'shakemap',
    label: 'Contornos MMI',
    description: 'ShakeMap del evento',
  },
] as const

export function LayerControl({
  visibility,
  onVisibilityChange,
  shakemapToggle,
}: LayerControlProps) {
  return (
    <fieldset className="layer-control">
      <legend>Capas</legend>
      <div className="layer-control__options">
        {LAYER_OPTIONS.map((option) => {
          const isShakemap = option.id === 'shakemap'
          const checked = isShakemap
            ? shakemapToggle.enabled && visibility.shakemap
            : visibility[option.id]
          const disabled = isShakemap && !shakemapToggle.enabled
          const description = isShakemap
            ? shakemapToggle.hint
            : option.description

          return (
            <label
              className={
                disabled
                  ? 'layer-control__option layer-control__option--disabled'
                  : 'layer-control__option'
              }
              key={option.id}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
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
                <small>{description}</small>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
