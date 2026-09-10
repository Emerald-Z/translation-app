import { Link } from 'react-router-dom'
import { languageLabel } from '../lib/languages'
import mouse from '../assets/art/stat-languages.png'

/** Tinted mascot tile used to browse cards by language. */
const TINTS = ['#C9C0A0', '#D9B3B3', '#B6BDD3', '#AEBFA2', '#D4C6A8', '#C3B9CE']

interface Props {
  code: string
  count: number
  index: number
}

export default function LanguageTile({ code, count, index }: Props) {
  return (
    <Link
      to={`/cards/language/${code}`}
      className="block w-[118px] overflow-hidden bg-white shadow-card transition hover:opacity-95"
    >
      <div
        className="flex h-[104px] items-end justify-center"
        style={{ background: TINTS[index % TINTS.length] }}
      >
        <img src={mouse} alt="" className="h-[92px] w-auto object-contain mix-blend-multiply" />
      </div>
      <div className="px-2.5 py-2">
        <p className="truncate text-[12px] font-bold text-ink">{languageLabel(code)}</p>
        <p className="text-[11px] text-ink-soft">{count} cards saved</p>
      </div>
    </Link>
  )
}
