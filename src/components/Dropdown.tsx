import Icon from './Icon'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
}

/**
 * A native select styled as the design's white field with a caret. Native
 * keeps keyboard and mobile behaviour correct.
 */
export default function Dropdown({
  value,
  options,
  onChange,
  placeholder,
  className = '',
  size = 'sm',
}: Props) {
  return (
    <div className={`relative inline-flex ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xs border border-line bg-white pl-3 pr-8 text-ink
          focus:border-peri focus:outline-none ${size === 'sm' ? 'py-1.5 text-[13px]' : 'py-2.5 text-sm'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink"
        strokeWidth={2.4}
      />
    </div>
  )
}
