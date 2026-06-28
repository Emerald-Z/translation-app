import { useState } from 'react'
import Library from './pages/Library'
import PDFViewer from './components/PDFViewer'
import { type Book, getBookUrl, saveLastPage } from './lib/books'

type View =
  | { type: 'library' }
  | { type: 'reader'; book: Book; url: string }

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

  if (loadingBook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Opening book…
      </div>
    )
  }

  if (view.type === 'reader') {
    const { book, url } = view
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 truncate max-w-lg">{book.filename}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Highlight any Chinese text to see pinyin + translation</p>
          </div>
          <button
            onClick={() => setView({ type: 'library' })}
            className="text-sm text-gray-500 hover:text-gray-800 transition shrink-0 ml-4"
          >
            ← Library
          </button>
        </header>
        <main className="px-6 py-8">
          <PDFViewer
            url={url}
            initialPage={book.last_page}
            onPageChange={(page, total) => saveLastPage(book.id, page, total)}
          />
        </main>
      </div>
    )
  }

  return <Library onOpen={openBook} />
}
