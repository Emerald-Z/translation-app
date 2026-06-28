import { useState, useEffect } from 'react'
import { type Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Library from './pages/Library'
import Dictionary from './pages/Dictionary'
import PDFViewer from './components/PDFViewer'
import { type Book, getBookUrl, saveLastPage } from './lib/books'

type View =
  | { type: 'library' }
  | { type: 'reader'; book: Book; url: string }
  | { type: 'dictionary' }

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [view, setView] = useState<View>({ type: 'library' })
  const [loadingBook, setLoadingBook] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      if (!session) setView({ type: 'library' })
    })
    return () => subscription.unsubscribe()
  }, [])

  async function openBook(book: Book) {
    setLoadingBook(true)
    try {
      const url = await getBookUrl(book.storage_path)
      setView({ type: 'reader', book, url })
    } finally {
      setLoadingBook(false)
    }
  }

  // Still checking auth state
  if (session === undefined) return null

  // Not logged in
  if (session === null) return <Login />

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

        <div className="flex items-center gap-4">
          {view.type === 'reader' && (
            <p className="text-sm text-gray-400 truncate max-w-sm hidden sm:block">
              {view.book.filename}
            </p>
          )}
          <span className="text-xs text-gray-400 hidden sm:block">{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-gray-400 hover:text-gray-700 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-6 py-8">
        {loadingBook ? (
          <div className="flex items-center justify-center h-64 text-gray-400">Opening book…</div>
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
