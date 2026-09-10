import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BookCover from '../components/BookCover'
import EmptyState from '../components/EmptyState'
import { bookProgress, bookTitle, listBooks, type Book } from '../lib/books'
import { languageLabel } from '../lib/languages'

/** Landing for the Read nav item: choose which book to open. */
export default function ReadPicker() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listBooks()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [])

  const ordered = [...books].sort((a, b) =>
    new Date(b.last_opened_at ?? b.created_at).getTime() -
    new Date(a.last_opened_at ?? a.created_at).getTime()
  )

  return (
    <div className="max-w-[1100px]">
      <h1 className="h-display">Read</h1>
      <p className="mt-1 font-display text-[15px] italic text-olive">
        Pick up where you left off
      </p>

      {ordered.length ? (
        <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {ordered.map(book => (
            <Link key={book.id} to={`/read/${book.id}`} className="group">
              <div className="aspect-[3/4] overflow-hidden shadow-card transition group-hover:opacity-95">
                <BookCover book={book} />
              </div>
              <p className="mt-2 font-display text-[15px] font-bold leading-tight text-ink">
                {bookTitle(book)}
              </p>
              <p className="text-[11px] text-ink-soft">{languageLabel(book.language)}</p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-peri-soft">
                <div className="h-full rounded-full bg-peri" style={{ width: `${bookProgress(book)}%` }} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState className="mt-8 h-[220px]">
          {loading ? 'Loading…' : (
            <span>
              Nothing to read yet. <Link to="/add" className="underline">Add a book</Link> to begin.
            </span>
          )}
        </EmptyState>
      )}
    </div>
  )
}
