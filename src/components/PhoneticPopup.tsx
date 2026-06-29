import { useEffect, useRef, useState } from 'react'
import { getPhonetics } from '../lib/phonetics'
import { translate } from '../lib/translate'

interface Props {
  text: string
  language: string
  x: number
  y: number
  onClose: () => void
  onSave: (text: string, phonetic: string, translation: string) => Promise<void>
}

export default function PhoneticPopup({ text, language, x, y, onClose, onSave }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [translationText, setTranslationText] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [transError, setTransError] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const phonetics = getPhonetics(text, language)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  useEffect(() => {
    setTranslationText(null)
    setTransError(false)
    setTranslating(true)
    translate(text, language)
      .then(setTranslationText)
      .catch(() => setTransError(true))
      .finally(() => setTranslating(false))
  }, [text, language])

  async function handleSave() {
    if (!translationText || saveState !== 'idle') return
    setSaveState('saving')
    try {
      await onSave(text, phonetics?.full ?? '', translationText)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y, zIndex: 9999, maxWidth: '90vw' }}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 select-none"
    >
      {/* Phonetic segment display — works for all languages */}
      {phonetics ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {phonetics.segments.map((seg, i) => (
            <div key={i} className="flex flex-col items-center min-w-[1rem]">
              <span className="text-xs text-indigo-500 leading-none mb-1 whitespace-nowrap">
                {seg.phonetic}
              </span>
              <span className="text-2xl leading-none text-gray-800">{seg.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-2xl text-gray-800 mb-3">{text}</p>
      )}

      {/* Full romanization */}
      {phonetics?.full && (
        <div className="text-sm text-gray-400 border-t border-gray-100 pt-2 pb-2">
          {phonetics.full}
        </div>
      )}

      {/* Translation */}
      <div className="border-t border-gray-100 pt-2 pb-3 text-sm">
        {translating && <span className="text-gray-400 italic">Translating…</span>}
        {!translating && translationText && <span className="text-gray-700">{translationText}</span>}
        {!translating && transError && <span className="text-red-400 text-xs">Translation unavailable</span>}
      </div>

      {/* Save button */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={handleSave}
          disabled={translating || !translationText || saveState !== 'idle'}
          className={`w-full py-1.5 rounded-lg text-sm font-medium transition
            ${saveState === 'saved'
              ? 'bg-green-50 text-green-600 border border-green-200'
              : saveState === 'saving'
              ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-wait'
              : translating || !translationText
              ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
              : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
            }`}
        >
          {saveState === 'saved' ? '✓ Saved to Dictionary' : saveState === 'saving' ? 'Saving…' : 'Save to Dictionary'}
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none w-6 h-6 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  )
}
