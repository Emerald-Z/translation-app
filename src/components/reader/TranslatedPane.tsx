import { useEffect, useState } from 'react'
import { translatePassage } from '../../lib/translate'

interface Props {
  text: string
  from: string
  to: string
  fontScale: 0 | 1 | 2
  className?: string
}

const SIZE = ['text-[13px]', 'text-[15px]', 'text-[17px]'] as const

/** Renders the translated body of the current page. */
export default function TranslatedPane({ text, from, to, fontScale, className = '' }: Props) {
  const [out, setOut] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setOut(null)
    setError(false)
    if (!text.trim()) { setOut(''); return }

    translatePassage(text, from, to)
      .then(result => { if (!cancelled) setOut(result) })
      .catch(() => { if (!cancelled) setError(true) })

    return () => { cancelled = true }
  }, [text, from, to])

  return (
    <div className={`min-h-[70vh] bg-white px-12 py-14 ${className}`}>
      {out === null && !error && (
        <p className="text-center text-sm italic text-ink-soft">Translating this page…</p>
      )}
      {error && (
        <p className="text-center text-sm text-ink-soft">
          Translation is unavailable right now.
        </p>
      )}
      {out !== null && (
        <div className={`space-y-4 font-serif leading-relaxed text-neutral-900 ${SIZE[fontScale]}`}>
          {out.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  )
}
