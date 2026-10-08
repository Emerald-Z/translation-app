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
  onPatchCard: (id: string, patch: Partial<Card>) => void
  onRemoveCard: (id: string) => void
  onToggleFavorite: (book: Book) => void
  onGoToCard: (card: Card) => void
  onClose: () => void
}

/** Right-hand drawer: book details plus every card saved from this book. */
export default function BookPanel({
  book, cards, onTogglePin, onPatchCard, onRemoveCard, onToggleFavorite, onGoToCard, onClose,
}: Props) {
  const progress = bookProgress(book)

  return (
    <aside className="absolute right-0 top-0 z-30 flex h-full w-[396px] flex-col bg-white shadow-panel">
      <div className="relative flex gap-4 bg-sand p-4">
        <div className="relative h-[200px] w-[147px] shrink-0 overflow-hidden shadow-card">
          <BookCover book={book} />
          <button
            onClick={() => onToggleFavorite(book)}
            aria-label={book.favorite ? 'Remove from favourites' : 'Add to favourites'}
            className="absolute right-1.5 top-1.5"
          >
            <Icon
              name="heart"
              size={20}
              filled={Boolean(book.favorite)}
              className={book.favorite ? 'text-heart' : 'text-white drop-shadow'}
            />
          </button>
        </div>

        <div className="min-w-0 flex-1 pr-6">
          <p className="font-display text-[17px] font-bold leading-tight text-ink">
            {bookTitle(book)}
          </p>
          {book.author && <p className="mt-0.5 text-[13px] text-ink">{book.author}</p>}
          <span className="mt-2 inline-block rounded-xs bg-white px-3 py-1 text-[12px] text-ink">
            {languageLabel(book.language)}
          </span>
          <div className="mt-5 h-3.5 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-peri" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-[13px] text-ink">{progress}% Complete</p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close panel"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink"
        >
          <Icon name="close" size={12} strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <h3 className="text-[17px] text-ink">Saved Cards</h3>
        <span className="text-[13px] text-ink">{cards.length} Cards</span>
      </div>

      <div className="scroll-slim flex-1 space-y-3 overflow-y-auto px-5 pb-6">
        {cards.length ? (
          cards.map(card => (
            <VocabCard
              key={card.id}
              card={card}
              onTogglePin={onTogglePin}
              onOpen={onGoToCard}
              onChanged={patch => onPatchCard(card.id, patch)}
              onDeleted={() => onRemoveCard(card.id)}
            />
          ))
        ) : (
          <p className="pt-[220px] text-center text-[15px] text-peri">No cards saved yet</p>
        )}
      </div>
    </aside>
  )
}
