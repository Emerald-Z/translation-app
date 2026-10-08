import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { getPhonetics, segmentTerms, speak, type Term } from '../lib/phonetics'
import { getLanguage } from '../lib/languages'
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

type Tab = 'translate' | 'learn'

export default function PhoneticPopup({
  text, language, target, showPhonetics, x, y, onClose, onSave,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<Tab>('translate')

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y, zIndex: 60, width: 317 }}
      className="select-none overflow-hidden rounded-xs bg-white shadow-panel"
    >
      <div className="flex items-stretch bg-[#C8CFE9]">
        <Tabs tab={tab} onChange={setTab} />
        <button
          onClick={onClose}
          aria-label="Close"
          className="mr-2 flex w-8 items-center justify-center self-center"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E4E7F4] text-ink">
            <Icon name="close" size={10} strokeWidth={2.4} />
          </span>
        </button>
      </div>

      <Header text={text} language={language} showPhonetics={showPhonetics} />

      {tab === 'translate' ? (
        <TranslateTab
          text={text} language={language} target={target}
          showPhonetics={showPhonetics} onSave={onSave} onClose={onClose}
        />
      ) : (
        <LearnTab text={text} language={language} target={target} onSave={onSave} />
      )}
    </div>
  )
}

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const item = (value: Tab, label: string) => (
    <button
      key={value}
      onClick={() => onChange(value)}
      aria-pressed={tab === value}
      className={`px-5 py-2 text-[13px] transition ${
        tab === value ? 'bg-ink text-white' : 'text-ink hover:bg-white/40'
      }`}
    >
      {label}
    </button>
  )
  return <div className="flex flex-1">{item('translate', 'Translate')}{item('learn', 'Learn')}</div>
}

/** The selected text with its romanization and a read-aloud button. */
function Header({
  text, language, showPhonetics,
}: { text: string; language: string; showPhonetics: boolean }) {
  const phonetics = showPhonetics ? getPhonetics(text, language) : null
  return (
    <div className="flex items-start gap-2 px-4 pt-3">
      <div className="min-w-0 flex-1">
        <p className="text-[17px] leading-snug text-ink">{text}</p>
        {phonetics?.full && (
          <p className="mt-0.5 text-[13px] italic leading-snug text-olive">{phonetics.full}</p>
        )}
      </div>
      <button
        onClick={() => speak(text, language)}
        aria-label="Read aloud"
        className="mt-0.5 shrink-0 text-ink transition hover:text-peri"
      >
        <Icon name="speaker" size={18} />
      </button>
    </div>
  )
}

function TranslateTab({
  text, language, target, showPhonetics, onSave, onClose,
}: {
  text: string
  language: string
  target: string
  showPhonetics: boolean
  onSave: (text: string, phonetic: string, translation: string) => Promise<void>
  onClose: () => void
}) {
  const [translation, setTranslation] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    setTranslation(null)
    setFailed(false)
    translate(text, language, target).then(setTranslation).catch(() => setFailed(true))
  }, [text, language, target])

  async function handleSave() {
    if (!translation || saveState !== 'idle') return
    setSaveState('saving')
    try {
      await onSave(text, showPhonetics ? getPhonetics(text, language)?.full ?? '' : '', translation)
      setSaveState('saved')
      setTimeout(onClose, 900)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className="px-4 pb-4">
      <div className="mt-3 border-t border-olive pt-2 text-[13px]">
        {!translation && !failed && <span className="italic text-ink-soft">Translating…</span>}
        {translation && <span className="text-ink">{translation}</span>}
        {failed && <span className="text-ink-soft">Translation unavailable</span>}
      </div>

      <p className="mt-4 text-[10px] text-ink-soft">
        Translation source: {getLanguage(language).label} to {getLanguage(target).label} via Google Translate
      </p>

      <button
        onClick={handleSave}
        disabled={!translation || saveState !== 'idle'}
        className="btn-secondary mt-2 w-full disabled:shadow-none"
      >
        {saveState === 'saved' ? 'Saved to Cards' : saveState === 'saving' ? 'Saving…' : 'Save to Cards'}
      </button>
    </div>
  )
}

/** Breaks the selection into terms, each independently expandable and savable. */
function LearnTab({
  text, language, target, onSave,
}: {
  text: string
  language: string
  target: string
  onSave: (text: string, phonetic: string, translation: string) => Promise<void>
}) {
  const [terms, setTerms] = useState<Term[]>([])

  useEffect(() => { setTerms(segmentTerms(text, language)) }, [text, language])

  return (
    <div className="px-4 pb-4">
      <p className="mt-3 border-t border-olive pt-2 text-[13px] text-ink">
        Character Term Breakdown
      </p>

      <div className="scroll-slim mt-2 max-h-[300px] space-y-2 overflow-y-auto">
        {terms.length ? (
          terms.map((term, i) => (
            <TermRow
              key={`${term.text}-${i}`}
              term={term}
              language={language}
              target={target}
              defaultOpen={i === 0}
              onSave={onSave}
            />
          ))
        ) : (
          <p className="py-4 text-center text-[12px] text-ink-soft">
            Nothing to break down in this selection.
          </p>
        )}
      </div>
    </div>
  )
}

function TermRow({
  term, language, target, defaultOpen, onSave,
}: {
  term: Term
  language: string
  target: string
  defaultOpen: boolean
  onSave: (text: string, phonetic: string, translation: string) => Promise<void>
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [translation, setTranslation] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    if (!open || translation || failed) return
    translate(term.text, language, target).then(setTranslation).catch(() => setFailed(true))
  }, [open, term.text, language, target, translation, failed])

  async function handleSave() {
    if (saveState !== 'idle') return
    setSaveState('saving')
    try {
      await onSave(term.text, term.phonetic, translation ?? '')
      setSaveState('saved')
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className="bg-cream p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] leading-snug text-ink">{term.text}</p>
          {term.phonetic && (
            <p className="mt-0.5 text-[12px] italic leading-snug text-olive">{term.phonetic}</p>
          )}
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1 text-[13px] text-ink"
        >
          Translation
          <Icon
            name="chevron-down" size={13} strokeWidth={2}
            className={open ? 'rotate-180 transition' : 'transition'}
          />
        </button>
      </div>

      {open && (
        <>
          <div className="mt-2 border-t border-olive pt-2 text-[13px]">
            {!translation && !failed && <span className="italic text-ink-soft">Looking up…</span>}
            {translation && <span className="text-ink">{translation}</span>}
            {failed && <span className="text-ink-soft">Lookup unavailable</span>}
          </div>
          <p className="mt-3 text-[10px] text-ink-soft">Dictionary source: Google Translate</p>
        </>
      )}

      <button
        onClick={handleSave}
        disabled={saveState !== 'idle'}
        className="btn-secondary mt-2 w-full disabled:shadow-none"
      >
        {saveState === 'saved' ? 'Saved to Cards' : saveState === 'saving' ? 'Saving…' : 'Save to Cards'}
      </button>
    </div>
  )
}
