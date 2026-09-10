import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { getPhonetics } from '../lib/phonetics'
import { translate } from '../lib/translate'

interface Props {
  text: string
  language: string
  target: string
  showPhonetics: boolean
  x: number
  y: number
  onClose: () => void
  onSave: (text: string, phonetic: string, translation: string) => Promise<void>
}

export default function PhoneticPopup({
  text, language, target, showPhonetics, x, y, onClose, onSave,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [translation, setTranslation] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [failed, setFailed] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const phonetics = showPhonetics ? getPhonetics(text, language) : null

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  useEffect(() => {
    setTranslation(null)
    setFailed(false)
    setTranslating(true)
    translate(text, language, target)
      .then(setTranslation)
      .catch(() => setFailed(true))
      .finally(() => setTranslating(false))
  }, [text, language, target])

  async function handleSave() {
    if (!translation || saveState !== 'idle') return
    setSaveState('saving')
    try {
      await onSave(text, getPhonetics(text, language)?.full ?? '', translation)
      setSaveState('saved')
      setTimeout(onClose, 900)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y, zIndex: 60, width: 317 }}
      className="select-none rounded-xs border border-line bg-white p-4 shadow-panel"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream hover:text-ink"
      >
        <Icon name="close" size={12} strokeWidth={2.2} />
      </button>

      {phonetics ? (
        <div className="flex flex-wrap gap-x-2 gap-y-1 pr-6">
          {phonetics.segments.map((segment, i) => (
            <div key={i} className="flex min-w-[1rem] flex-col items-center">
              <span className="mb-0.5 whitespace-nowrap text-[11px] leading-none text-peri">
                {segment.phonetic}
              </span>
              <span className="text-[22px] leading-none text-ink">{segment.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="pr-6 text-[20px] leading-snug text-ink">{text}</p>
      )}

      {phonetics?.full && (
        <p className="mt-3 border-t border-line pt-2 text-[12px] text-ink-soft">{phonetics.full}</p>
      )}

      <div className="mt-2 border-t border-line pt-2 text-[13px]">
        {translating && <span className="italic text-ink-soft">Translating…</span>}
        {!translating && translation && <span className="text-ink">{translation}</span>}
        {!translating && failed && (
          <span className="text-ink-soft">Translation unavailable</span>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={translating || !translation || saveState !== 'idle'}
        className="btn-secondary mt-3 w-full disabled:shadow-none"
      >
        {saveState === 'saved' ? 'Saved to Cards' : saveState === 'saving' ? 'Saving…' : 'Save as Card'}
      </button>
    </div>
  )
}
