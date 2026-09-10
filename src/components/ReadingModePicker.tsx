import type { ReadingMode } from '../lib/supabase'

const MODES: { value: ReadingMode; label: string }[] = [
  { value: 'highlight', label: 'Highlight' },
  { value: 'side-by-side', label: 'Side-by-side' },
  { value: 'translated', label: 'Full Translation' },
]

interface Props {
  value: ReadingMode
  onChange: (mode: ReadingMode) => void
}

export default function ReadingModePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {MODES.map(mode => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`rounded-xs bg-peri-soft pt-2 text-center transition
            ${value === mode.value ? 'ring-2 ring-peri' : 'hover:bg-peri-soft/70'}`}
        >
          <span className="text-sm text-ink">{mode.label}</span>
          <div className="mt-2 px-3 pb-3">
            <Preview mode={mode.value} />
          </div>
        </button>
      ))}
    </div>
  )
}

/** Diagrammatic page mock-up shown under each mode name. */
function Preview({ mode }: { mode: ReadingMode }) {
  const lines = (count: number, tint: string) => (
    <div className="flex flex-col gap-[3px]">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`block h-[2px] ${tint}`}
          style={{ width: `${i % 4 === 3 ? 62 : 100}%` }}
        />
      ))}
    </div>
  )

  if (mode === 'side-by-side') {
    return (
      <div className="flex h-[86px] gap-1.5">
        <div className="flex-1 bg-white p-2">{lines(9, 'bg-ink/35')}</div>
        <div className="flex-1 bg-white p-2">{lines(9, 'bg-ink/20')}</div>
      </div>
    )
  }

  return (
    <div className="h-[86px] bg-white p-2.5">
      {lines(11, mode === 'translated' ? 'bg-ink/20' : 'bg-ink/35')}
    </div>
  )
}
