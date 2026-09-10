import { useEffect, useMemo, useState } from 'react'
import BookRow from '../components/BookRow'
import BookTile from '../components/BookTile'
import Dropdown from '../components/Dropdown'
import EditBookModal from '../components/EditBookModal'
import EmptyState from '../components/EmptyState'
import Shelf from '../components/Shelf'
import {
  bookProgress, bookTitle, deleteBook, listBooks, setFavorite, type Book,
} from '../lib/books'
import { languageLabel } from '../lib/languages'

type Sort = 'recent' | 'title' | 'author' | 'progress' | 'language'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'author', label: 'Author' },
  { value: 'progress', label: 'Progress' },
  { value: 'language', label: 'Language' },
]

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<Sort>('recent')
  const [editing, setEditing] = useState<Book | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listBooks()
      .then(setBooks)
      .catch(() => setError('Could not load your library.'))
      .finally(() => setLoading(false))
  }, [])

  const favorites = books.filter(b => b.favorite)

  const sorted = useMemo(() => {
    const list = [...books]
    switch (sort) {
      case 'title': return list.sort((a, b) => bookTitle(a).localeCompare(bookTitle(b)))
      case 'author': return list.sort((a, b) => (a.author ?? '').localeCompare(b.author ?? ''))
      case 'progress': return list.sort((a, b) => bookProgress(b) - bookProgress(a))
      case 'language': return list.sort((a, b) =>
        languageLabel(a.language).localeCompare(languageLabel(b.language)))
      default: return list
    }
  }, [books, sort])

  async function toggleFavorite(book: Book) {
    const next = !book.favorite
    setBooks(bs => bs.map(b => (b.id === book.id ? { ...b, favorite: next } : b)))
    await setFavorite(book.id, next)
  }

  async function handleDelete(book: Book) {
    if (!confirm(`Delete "${bookTitle(book)}"? This also removes its saved cards.`)) return
    try {
      await deleteBook(book.id, book.storage_path)
      setBooks(bs => bs.filter(b => b.id !== book.id))
    } catch {
      setError('Could not delete that book.')
    }
  }

  return (
    <div className="max-w-[1160px]">
      <h1 className="h-display">Library</h1>

      {error && (
        <p className="mt-4 rounded-xs bg-rose/40 px-3 py-2 text-sm text-[#5C0A0C]">{error}</p>
      )}

      <div className="mt-4">
        {favorites.length ? (
          <div className="flex items-start gap-5 overflow-x-auto pb-2">
            {favorites.map(book => (
              <BookTile key={book.id} book={book} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        ) : (
          <EmptyState className="h-[240px]">
            {loading ? 'Loading…' : 'Favorite books will appear here'}
          </EmptyState>
        )}
        <Shelf className="mt-1" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-[19px] text-ink">All Titles</h2>
        <Dropdown
          value={sort}
          onChange={v => setSort(v as Sort)}
          options={SORTS}
          className="w-[150px]"
        />
      </div>

      <div className="mt-4 space-y-3">
        {sorted.length ? (
          sorted.map(book => (
            <BookRow
              key={book.id}
              book={book}
              onToggleFavorite={toggleFavorite}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyState className="h-[120px]">
            {loading ? 'Loading…' : 'Book titles will appear here'}
          </EmptyState>
        )}
      </div>

      {editing && (
        <EditBookModal
          book={editing}
          onClose={() => setEditing(null)}
          onSaved={patch =>
            setBooks(bs => bs.map(b => (b.id === editing.id ? { ...b, ...patch } : b)))
          }
        />
      )}
    </div>
  )
}
