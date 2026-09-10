interface Props {
  label: string
  value: number
  unit: string
  art: string
  tone: 'blue' | 'sand' | 'rose'
}

const TONE = {
  blue: { bg: 'bg-peri-faint', label: 'text-ink', value: 'text-ink' },
  sand: { bg: 'bg-sand', label: 'text-olive', value: 'text-olive' },
  rose: { bg: 'bg-rose', label: 'text-[#5C0A0C]', value: 'text-[#5C0A0C]' },
} as const

export default function StatTile({ label, value, unit, art, tone }: Props) {
  const t = TONE[tone]
  return (
    <div className={`relative flex h-[62px] w-[222px] items-center overflow-hidden rounded-xs ${t.bg} pl-3 shadow-card`}>
      <div className="relative z-10">
        <p className={`text-[11px] leading-none ${t.label}`}>{label}</p>
        <p className="mt-1.5 flex items-baseline gap-1.5">
          <span className={`text-[19px] font-bold leading-none ${t.value}`}>{value}</span>
          <span className={`text-[15px] leading-none ${t.value}`}>{unit}</span>
        </p>
      </div>
      <img
        src={art}
        alt=""
        className="pointer-events-none absolute bottom-0 right-0 h-[60px] w-auto object-contain"
      />
    </div>
  )
}
