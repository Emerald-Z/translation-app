import { useEffect, useState, useCallback } from 'react'
import { type Book, listBooks, uploadBook, deleteBook } from '../lib/books'
import FileUpload from '../components/FileUpload'

interface Props {
  onOpen: (book: Book) => void
}

export default function Library({ onOpen }: Props) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setBooks(await listBooks())
    } catch {
      setError('Failed to load library.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const book = await uploadBook(file)
      setBooks(prev => [book, ...prev])
    } catch {
      setError('Upload failed. Check your Supabase storage bucket exists and RLS policies are set.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(book: Book, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${book.filename}"?`)) return
    try {
      await deleteBook(book.id, book.storage_path)
      setBooks(prev => prev.filter(b => b.id !== book.id))
    } catch {
      setError('Failed to delete book.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Chinese Reader</h1>
        <p className="text-xs text-gray-500 mt-0.5">Your library</p>
      </header>

      <main className="px-6 py-8 max-w-5xl mx-auto">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-8">
          {uploading ? (
            <div className="flex items-center justify-center h-56 border-2 border-dashed border-indigo-300 rounded-2xl bg-indigo-50 text-indigo-400">
              Uploading…
            </div>
          ) : (
            <FileUpload onFile={handleFile} />
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading library…</div>
        ) : books.length === 0 ? (
          <div className="text-center text-gray-400 py-16">No books yet — upload one above.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {books.map(book => (
              <div
                key={book.id}
                onClick={() => onOpen(book)}
                className="group relative bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Book cover placeholder */}
                <div className="w-full aspect-[3/4] bg-indigo-50 rounded-lg mb-3 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>

                <p className="text-sm font-medium text-gray-800 truncate">{book.filename}</p>

                {book.total_pages && (
                  <div className="mt-1">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${Math.round((book.last_page / book.total_pages) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      p. {book.last_page} / {book.total_pages}
                    </p>
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={e => handleDelete(book, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
