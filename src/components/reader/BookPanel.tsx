import BookCover from '../BookCover'
import Icon from '../Icon'
import VocabCard from '../VocabCard'
import { bookProgress, bookTitle, type Book } from '../../lib/books'
import { languageLabel } from '../../lib/languages'
import type { Card } from '../../lib/cards'

interface Props {
  book: Book
  cards: Card[]
  onTogglePin: (card: Card) => void
  onGoToCard: (card: Card) => void
  onClose: () => void
}

/** Right-hand drawer: book details plus every card saved from this book. */
export default function BookPanel({ book, cards, onTogglePin, onGoToCard, onClose }: Props) {
  const progress = bookProgress(book)

  return (
    <aside className="absolute right-0 top-0 z-30 flex h-full w-[380px] flex-col bg-cream shadow-panel">
      <div className="relative flex gap-4 bg-sand p-4">
        <div className="h-[150px] w-[110px] shrink-0 overflow-hidden shadow-card">
          <BookCover book={book} />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <p className="font-display text-[17px] font-bold leading-tight text-ink">
            {bookTitle(book)}
          </p>
          {book.author && <p className="mt-0.5 text-[12px] text-ink-soft">{book.author}</p>}
          <span className="mt-2 inline-block rounded-xs bg-white px-2 py-1 text-[11px] text-ink">
            {languageLabel(book.language)}
          </span>
          <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-peri" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-[12px] text-ink">{progress}% Complete</p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close panel"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink"
        >
          <Icon name="close" size={12} strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h3 className="text-[17px] text-ink">Saved Cards</h3>
        <span className="text-[13px] text-ink">{cards.length} Cards</span>
      </div>

      <div className="scroll-slim flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {cards.length ? (
          cards.map(card => (
            <VocabCard key={card.id} card={card} onTogglePin={onTogglePin} onOpen={onGoToCard} />
          ))
        ) : (
          <p className="pt-10 text-center text-sm text-ink-soft">
            Select text while reading to save your first card.
          </p>
        )}
      </div>
    </aside>
  )
}
