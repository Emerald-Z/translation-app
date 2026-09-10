import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import Icon from './Icon'
import { bookProgress, bookTitle, type Book } from '../lib/books'
import { languageLabel } from '../lib/languages'

interface Props {
  book: Book
  onToggleFavorite?: (book: Book) => void
  width?: number
}

/** A cover standing on a shelf: Home "Recent Activity" and Library favourites. */
export default function BookTile({ book, onToggleFavorite, width = 136 }: Props) {
  const progress = bookProgress(book)

  return (
    <div style={{ width }} className="shrink-0">
      <Link
        to={`/read/${book.id}`}
        className="relative block aspect-[3/4] overflow-hidden shadow-card transition hover:opacity-95"
      >
        <BookCover book={book} />

        {onToggleFavorite && (
          <button
            onClick={e => { e.preventDefault(); onToggleFavorite(book) }}
            aria-label={book.favorite ? 'Remove from favourites' : 'Add to favourites'}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 shadow-card"
          >
            <Icon
              name="heart"
              size={14}
              filled={Boolean(book.favorite)}
              className={book.favorite ? 'text-heart' : 'text-ink-soft'}
            />
          </button>
        )}

        <span className="absolute bottom-1.5 left-1.5 rounded-xs bg-white px-2 py-0.5 text-[11px] text-ink shadow-card">
          {languageLabel(book.language)}
        </span>
      </Link>

      <p className="mt-2 font-display text-[15px] font-bold leading-tight text-ink">
        {bookTitle(book)}
      </p>
      {book.author && <p className="text-[11px] text-ink-soft">{book.author}</p>}

      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-peri-soft">
        <div className="h-full rounded-full bg-peri" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
