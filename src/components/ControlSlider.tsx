interface ControlSliderProps {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  unit?: string
}

export function ControlSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit = '',
}: ControlSliderProps) {
  return (
    <label className="control-row">
      <span className="control-label">
        {label}: {value}
        {unit}
      </span>
      <input
        className="control-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
