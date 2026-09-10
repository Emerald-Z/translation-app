import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Reader from '../components/reader/Reader'
import { getBook, getBookUrl, type Book } from '../lib/books'

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookId) return
    let cancelled = false
    setBook(null)
    setUrl(null)
    setError(null)

    getBook(bookId)
      .then(async b => {
        const signed = await getBookUrl(b.storage_path)
        if (cancelled) return
        setBook(b)
        setUrl(signed)
      })
      .catch(() => { if (!cancelled) setError('That book could not be opened.') })

    return () => { cancelled = true }
  }, [bookId])

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <p className="text-sm text-ink">{error}</p>
        <Link to="/library" className="btn-secondary">Back to Library</Link>
      </div>
    )
  }

  if (!book || !url) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-sm text-ink-soft">
        Opening book…
      </div>
    )
  }

  return <Reader book={book} url={url} />
}
