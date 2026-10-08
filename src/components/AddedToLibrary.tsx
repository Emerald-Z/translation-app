import BookCover from './BookCover'
import type { Book } from '../lib/books'

interface Props {
  book: Book | null
  title: string
  coverPreview: string | null
  onHome: () => void
  onRead: () => void
}

/**
 * Confirmation shown once a book joins the library.
 *
 * The design sets this dialog against a zoomed-out view of the reading room.
 * The only scene asset available here is the tighter crop used on the signed-out
 * screens, and cropping it to a band cuts the mascot in half, so the panel is
 * left plain until that artwork can be exported from the design file.
 */
export default function AddedToLibrary({ book, title, coverPreview, onHome, onRead }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="w-full max-w-[800px] overflow-hidden rounded-xs bg-cream shadow-panel">
        <div className="flex flex-col items-center px-8 py-14">
          <div className="h-[220px] w-[160px] overflow-hidden shadow-card">
            {coverPreview ? (
              <img src={coverPreview} alt="" className="h-full w-full object-cover" />
            ) : book ? (
              <BookCover book={book} />
            ) : (
              <div className="flex h-full items-center justify-center bg-sand-soft px-3 text-center text-xs text-ink-soft">
                {title}
              </div>
            )}
          </div>

          <p className="mt-7 text-center text-[17px] text-ink">
            A new book has been added to your library!
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button onClick={onHome} className="btn-secondary px-10">Return Home</button>
            <button onClick={onRead} className="btn-secondary px-10">Start Reading</button>
          </div>
        </div>
      </div>
    </div>
  )
}
