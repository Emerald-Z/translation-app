import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import type { Book } from '../lib/books'
import { bookTitle } from '../lib/books'

interface Props {
  book: Book
  count: number
}

/** Book jacket tile used to browse cards by book. */
export default function BookCardTile({ book, count }: Props) {
  return (
    <Link
      to={`/cards/book/${book.id}`}
      className="block w-[118px] overflow-hidden bg-white shadow-card transition hover:opacity-95"
    >
      <div className="h-[104px] overflow-hidden">
        <BookCover book={book} showTitle={false} />
      </div>
      <div className="px-2.5 py-2">
        <p className="truncate text-[12px] font-bold text-ink">{bookTitle(book)}</p>
        <p className="text-[11px] text-ink-soft">{count} cards saved</p>
      </div>
    </Link>
  )
}
