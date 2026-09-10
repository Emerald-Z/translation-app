import { coverUrl, bookTitle, type Book } from '../lib/books'

interface Props {
  book: Book
  className?: string
  /** Show the title on the placeholder. Turn off for thumbnails too small to read. */
  showTitle?: boolean
}

/** The jacket image, or a typographic stand-in when a book has no cover. */
export default function BookCover({ book, className = '', showTitle = true }: Props) {
  const url = coverUrl(book)

  if (url) {
    return <img src={url} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} />
  }

  return (
    <div
      className={`flex h-full w-full items-start bg-sand-soft ring-1 ring-inset ring-line ${className}`}
    >
      {showTitle && (
        <span className="line-clamp-4 px-2.5 pt-3 font-display text-[12px] font-bold leading-tight text-ink">
          {bookTitle(book)}
        </span>
      )}
    </div>
  )
}
