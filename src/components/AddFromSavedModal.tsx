import { useState } from 'react'
import VocabCard from './VocabCard'
import type { Card } from '../lib/cards'

interface Props {
  cards: Card[]
  onTogglePin?: (card: Card) => void
  title?: string
  confirmLabel?: string
  onCancel: () => void
  onDone: (cardIds: string[]) => void
}

/** Card picker: tap whole cards to select, as the design specifies. */
export default function AddFromSavedModal({
  cards, onTogglePin, title = 'Add From Saved Cards', confirmLabel = 'Done', onCancel, onDone,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(card: Card) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(card.id)) next.delete(card.id)
      else next.add(card.id)
      return next
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 px-4 py-8"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="flex max-h-full w-full max-w-[638px] flex-col overflow-hidden rounded-xs bg-white">
        <div className="px-8 pt-7 text-center">
          <h2 className="text-[22px] text-ink">{title}</h2>
          <p className="mt-1 text-[15px] font-bold text-ink">
            {selected.size} {selected.size === 1 ? 'Card' : 'Cards'} Selected
          </p>
        </div>

        <div className="scroll-slim mt-5 flex-1 overflow-y-auto px-8">
          {cards.length ? (
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              {cards.map(card => (
                <VocabCard
                  key={card.id}
                  card={card}
                  selected={selected.has(card.id)}
                  onSelect={toggle}
                  onTogglePin={onTogglePin}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink-soft">
              Every saved card is already in this collection.
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 px-8 py-6">
          <button onClick={onCancel} className="btn-secondary px-14">Cancel</button>
          <button
            onClick={() => onDone([...selected])}
            disabled={!selected.size}
            className="btn-secondary px-14"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
