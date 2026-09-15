type MagnitudeFilterProps = {
  value: number
  visibleCount: number
  totalCount: number
  onChange: (value: number) => void
}

const MIN_MAGNITUDE = -2
const MAX_MAGNITUDE = 8
const MAGNITUDE_STEP = 0.5

export function MagnitudeFilter({
  value,
  visibleCount,
  totalCount,
  onChange,
}: MagnitudeFilterProps) {
  const formattedValue = value.toFixed(1)

  return (
    <section
      className="magnitude-filter"
      aria-labelledby="magnitude-filter-title"
    >
      <div className="magnitude-filter__heading">
        <label id="magnitude-filter-title" htmlFor="min-magnitude">
          Magnitud mínima
        </label>
        <output htmlFor="min-magnitude">M ≥ {formattedValue}</output>
      </div>
      <input
        id="min-magnitude"
        type="range"
        min={MIN_MAGNITUDE}
        max={MAX_MAGNITUDE}
        step={MAGNITUDE_STEP}
        value={value}
        aria-valuetext={`Magnitud ${formattedValue} o superior`}
        onKeyDown={(event) => event.stopPropagation()}
        onChange={(event) => onChange(event.target.valueAsNumber)}
      />
      <div className="magnitude-filter__meta" aria-live="polite">
        <span>
          <strong>{visibleCount}</strong> visibles de {totalCount}
        </span>
        <span>Eventos sin magnitud se excluyen</span>
      </div>
    </section>
  )
}
