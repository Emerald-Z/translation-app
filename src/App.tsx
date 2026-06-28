import { useState } from 'react'
import Library from './pages/Library'
import Dictionary from './pages/Dictionary'
import PDFViewer from './components/PDFViewer'
import { type Book, getBookUrl, saveLastPage } from './lib/books'

type View =
  | { type: 'library' }
  | { type: 'reader'; book: Book; url: string }
  | { type: 'dictionary' }

export default function App() {
  const [view, setView] = useState<View>({ type: 'library' })
  const [loadingBook, setLoadingBook] = useState(false)

  async function openBook(book: Book) {
    setLoadingBook(true)
    try {
      const url = await getBookUrl(book.storage_path)
      setView({ type: 'reader', book, url })
    } finally {
      setLoadingBook(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-base font-semibold text-gray-900">Chinese Reader</span>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setView({ type: 'library' })}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                view.type === 'library'
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => setView({ type: 'dictionary' })}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                view.type === 'dictionary'
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Dictionary
            </button>
          </nav>
        </div>

        {view.type === 'reader' && (
          <p className="text-sm text-gray-400 truncate max-w-sm hidden sm:block">
            {view.book.filename}
          </p>
        )}
      </header>

      <main className="px-6 py-8">
        {loadingBook ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Opening book…
          </div>
        ) : view.type === 'library' ? (
          <Library onOpen={openBook} />
        ) : view.type === 'dictionary' ? (
          <Dictionary />
        ) : (
          <PDFViewer
            url={view.url}
            bookId={view.book.id}
            initialPage={view.book.last_page}
            onPageChange={(page, total) => saveLastPage(view.book.id, page, total)}
          />
        )}
      </main>
    </div>
  )
}
