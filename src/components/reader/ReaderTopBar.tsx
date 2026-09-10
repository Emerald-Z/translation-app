import { Link } from 'react-router-dom'
import BookCover from '../BookCover'
import Icon from '../Icon'
import { bookTitle, type Book } from '../../lib/books'

interface Props {
  book: Book
  panelOpen: boolean
  onTogglePanel: () => void
}

export default function ReaderTopBar({ book, panelOpen, onTogglePanel }: Props) {
  return (
    <header className="relative flex h-[74px] shrink-0 items-center bg-cream px-6">
      <Link
        to="/library"
        aria-label="Back to library"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-ink transition hover:bg-sand/70"
      >
        <Icon name="arrow-left" size={17} />
      </Link>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
        <div className="h-[38px] w-[28px] overflow-hidden shadow-card">
          <BookCover book={book} showTitle={false} />
        </div>
        <p className="font-display text-[17px] font-bold text-ink">{bookTitle(book)}</p>
      </div>

      <button
        onClick={onTogglePanel}
        aria-label="Saved cards for this book"
        aria-pressed={panelOpen}
        className={`ml-auto transition ${panelOpen ? 'text-peri' : 'text-ink hover:text-peri'}`}
      >
        <Icon name="notebook" size={40} filled strokeWidth={1} />
      </button>
    </header>
  )
}
