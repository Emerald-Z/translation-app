import Icon from './Icon'
import type { Card } from '../lib/cards'

interface Props {
  card: Card
  onTogglePin?: (card: Card) => void
  onOpen?: (card: Card) => void
  compact?: boolean
}

/** The saved word/phrase card used across Home, the Cards section and the reader. */
export default function VocabCard({ card, onTogglePin, onOpen, compact = false }: Props) {
  const translation = card.translation_override ?? card.translation

  return (
    <article
      onClick={onOpen ? () => onOpen(card) : undefined}
      className={`flex flex-col rounded-xs border border-line bg-white shadow-card transition
        ${onOpen ? 'cursor-pointer hover:border-peri-soft' : ''} ${compact ? 'p-3' : 'p-3.5'}`}
    >
      <p className="border-b border-[#C9BE8E]/60 pb-1.5 text-[15px] leading-snug text-ink">
        {card.text}
      </p>
      <p className="mt-1.5 text-[12px] italic leading-snug text-ink-soft">
        {translation || 'No translation yet'}
      </p>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] text-ink">
          {card.book_title}
          <span className="mx-1 text-ink-soft">•</span>
          <em className="text-[10px] not-italic text-ink-soft">pg. {card.page_number}</em>
        </p>

        {onTogglePin && (
          <button
            onClick={e => { e.stopPropagation(); onTogglePin(card) }}
            aria-label={card.pinned ? 'Unpin card' : 'Pin card'}
            className={`shrink-0 transition ${card.pinned ? 'text-peri' : 'text-ink-soft hover:text-peri'}`}
          >
            <Icon name="pin" size={16} filled={card.pinned} />
          </button>
        )}
      </div>
    </article>
  )
}
