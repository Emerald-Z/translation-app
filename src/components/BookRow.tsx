import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import Icon from './Icon'
import { bookProgress, bookTitle, type Book } from '../lib/books'
import { languageLabel } from '../lib/languages'

interface Props {
  book: Book
  onToggleFavorite: (book: Book) => void
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

/** One row of Library → All Titles. */
export default function BookRow({ book, onToggleFavorite, onEdit, onDelete }: Props) {
  const progress = bookProgress(book)
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="flex items-center gap-5 rounded-xs border border-line bg-white p-3 shadow-card">
      <Link to={`/read/${book.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-[62px] w-[46px] shrink-0 overflow-hidden">
          <BookCover book={book} showTitle={false} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-[16px] font-bold leading-tight text-ink">
            {bookTitle(book)}
          </p>
          {book.author && <p className="truncate text-[12px] text-ink-soft">{book.author}</p>}
        </div>
      </Link>

      <p className="hidden w-[86px] shrink-0 text-[13px] text-ink lg:block">
        {book.total_pages ? `${book.total_pages} Pages` : '—'}
      </p>

      <div className="hidden w-[320px] shrink-0 items-center gap-3 md:flex">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-peri-soft">
          <div className="h-full rounded-full bg-peri" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-[92px] shrink-0 text-[13px] text-ink">{progress}% Complete</span>
      </div>

      <span className="chip hidden shrink-0 sm:inline-flex">{languageLabel(book.language)}</span>

      <button
        onClick={() => onToggleFavorite(book)}
        aria-label={book.favorite ? 'Remove from favourites' : 'Add to favourites'}
        className="shrink-0"
      >
        <Icon
          name="heart"
          size={20}
          filled={Boolean(book.favorite)}
          className={book.favorite ? 'text-heart' : 'text-ink-soft hover:text-heart'}
        />
      </button>

      <div ref={ref} className="relative shrink-0">
        <button
          onClick={() => setMenu(m => !m)}
          aria-label="Book options"
          className="text-ink-soft transition hover:text-ink"
        >
          <Icon name="dots" size={18} />
        </button>
        {menu && (
          <div className="absolute right-0 top-7 z-30 w-[160px] rounded-xs bg-white p-1.5 shadow-panel">
            <button
              onClick={() => { setMenu(false); onEdit(book) }}
              className="w-full rounded-xs px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
            >
              Edit details
            </button>
            <button
              onClick={() => { setMenu(false); onDelete(book) }}
              className="w-full rounded-xs px-3 py-2 text-left text-sm text-heart transition hover:bg-cream"
            >
              Delete book
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
