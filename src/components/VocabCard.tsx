import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import Modal from './Modal'
import { deleteCard, updateCard, type Card } from '../lib/cards'

interface Props {
  card: Card
  onTogglePin?: (card: Card) => void
  onOpen?: (card: Card) => void
  /** Called after an edit is saved, so the owning list can update in place. */
  onChanged?: (patch: { translation_override: string | null; notes: string | null }) => void
  onDeleted?: () => void
  /** Selection mode: renders the tinted, ringed state and makes the card a toggle. */
  selected?: boolean
  onSelect?: (card: Card) => void
  compact?: boolean
}

/** The saved word or phrase, used on Home, in the Cards section and in the reader. */
export default function VocabCard({
  card, onTogglePin, onOpen, onChanged, onDeleted, selected, onSelect, compact = false,
}: Props) {
  const translation = card.translation_override ?? card.translation
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const hasMenu = Boolean(onChanged || onDeleted)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleDelete() {
    setMenu(false)
    if (!confirm(`Delete the card for “${card.text}”?`)) return
    await deleteCard(card.id)
    onDeleted?.()
  }

  return (
    <>
      <article
        onClick={
          onSelect ? () => onSelect(card) : onOpen ? () => onOpen(card) : undefined
        }
        aria-pressed={onSelect ? selected : undefined}
        className={`flex flex-col rounded-md border shadow-card transition
          ${selected ? 'border-ink bg-[#E9EBF3]' : 'border-rule bg-white'}
          ${onSelect || onOpen ? 'cursor-pointer' : ''}
          ${onSelect && !selected ? 'hover:border-peri-soft' : ''}
          ${onOpen && !onSelect ? 'hover:border-peri-soft' : ''}
          ${compact ? 'p-3' : 'p-3.5'}`}
      >
        <p className="text-[15px] leading-snug text-ink">{card.text}</p>

        {card.pinyin && (
          <p className="mt-0.5 text-[11px] italic leading-snug text-rule">{card.pinyin}</p>
        )}

        <p className="mt-1.5 border-t border-rule pt-1.5 text-[13px] leading-snug text-peri">
          {translation || 'No translation yet'}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-peri">
            {card.book_title}
            <span className="mx-1">•</span>
            <em className="text-[10px] not-italic">pg. {card.page_number}</em>
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            {onTogglePin && (
              <button
                onClick={e => { e.stopPropagation(); onTogglePin(card) }}
                aria-label={card.pinned ? 'Unpin card' : 'Pin card'}
                className={`transition ${card.pinned ? 'text-peri' : 'text-ink-soft hover:text-peri'}`}
              >
                <Icon name="pin" size={16} filled={card.pinned} />
              </button>
            )}

            {hasMenu && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={e => { e.stopPropagation(); setMenu(m => !m) }}
                  aria-label="Card options"
                  className="text-peri transition hover:text-ink"
                >
                  <Icon name="dots" size={15} />
                </button>
                {menu && (
                  <div className="absolute right-0 top-6 z-30 w-[164px] rounded-md bg-white p-1.5 shadow-panel">
                    {onChanged && (
                      <button
                        onClick={e => { e.stopPropagation(); setMenu(false); setEditing(true) }}
                        className="w-full rounded-xs px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                      >
                        Edit card
                      </button>
                    )}
                    {onDeleted && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete() }}
                        className="w-full rounded-xs px-3 py-2 text-left text-sm text-heart transition hover:bg-cream"
                      >
                        Delete card
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </article>

      {editing && onChanged && (
        <EditCard card={card} onClose={() => setEditing(false)} onSaved={onChanged} />
      )}
    </>
  )
}

function EditCard({
  card, onClose, onSaved,
}: {
  card: Card
  onClose: () => void
  onSaved: (patch: { translation_override: string | null; notes: string | null }) => void
}) {
  const [translation, setTranslation] = useState(card.translation_override ?? card.translation)
  const [notes, setNotes] = useState(card.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const patch = {
      // Storing null when it matches the machine translation keeps the original recoverable.
      translation_override: translation.trim() === card.translation.trim() ? null : translation.trim(),
      notes: notes.trim() || null,
    }
    await updateCard(card.id, patch)
    onSaved(patch)
    setSaving(false)
    onClose()
  }

  return (
    <Modal title="Edit Card" onClose={onClose} width={520}>
      <p className="text-[17px] text-ink">{card.text}</p>
      {card.pinyin && <p className="mt-0.5 text-[12px] italic text-ink-soft">{card.pinyin}</p>}

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="ec-translation">Translation</label>
          <input
            id="ec-translation" className="field" value={translation}
            onChange={e => setTranslation(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="ec-notes">Notes</label>
          <textarea
            id="ec-notes" rows={3} className="field resize-none" value={notes}
            placeholder="Anything worth remembering about this word"
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}
