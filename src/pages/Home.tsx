import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BookCover from '../components/BookCover'
import BookTile from '../components/BookTile'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import Shelf from '../components/Shelf'
import StatTile from '../components/StatTile'
import VocabCard from '../components/VocabCard'
import { bookProgress, bookTitle, listBooks, setFavorite, type Book } from '../lib/books'
import { listCards, setPinned, type Card } from '../lib/cards'
import { languageLabel } from '../lib/languages'
import { useProfile } from '../lib/profileContext'
import artBooks from '../assets/art/stat-books.png'
import artLanguages from '../assets/art/stat-languages.png'
import artCards from '../assets/art/stat-cards.png'

export default function Home() {
  const { profile } = useProfile()
  const [books, setBooks] = useState<Book[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listBooks().catch(() => []), listCards().catch(() => [])])
      .then(([b, c]) => { setBooks(b); setCards(c) })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    completed: books.filter(b => bookProgress(b) >= 100).length,
    languages: new Set(books.map(b => b.language)).size,
    cards: cards.length,
  }), [books, cards])

  const current = useMemo(() => {
    const started = books.filter(b => b.last_page > 1)
    const pool = started.length ? started : books
    return [...pool].sort((a, b) =>
      new Date(b.last_opened_at ?? b.created_at).getTime() -
      new Date(a.last_opened_at ?? a.created_at).getTime()
    )[0]
  }, [books])

  const recent = books.slice(0, 6)
  const pinned = cards.filter(c => c.pinned)

  async function toggleFavorite(book: Book) {
    const next = !book.favorite
    setBooks(bs => bs.map(b => (b.id === book.id ? { ...b, favorite: next } : b)))
    await setFavorite(book.id, next)
  }

  async function togglePin(card: Card) {
    const next = !card.pinned
    setCards(cs => cs.map(c => (c.id === card.id ? { ...c, pinned: next } : c)))
    await setPinned(card.id, next)
  }

  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="h-display">
          {books.length ? 'Welcome Back' : 'Welcome'} {profile?.username ?? ''}
        </h1>
        <p className="mt-1 font-display text-[15px] italic text-olive">
          Where will the words take you today?
        </p>

        <div className="mt-5 flex flex-wrap gap-4">
          <StatTile label="Books Completed" value={stats.completed} unit="Books" art={artBooks} tone="blue" />
          <StatTile label="Languages Explored" value={stats.languages} unit="Languages" art={artLanguages} tone="sand" />
          <StatTile label="Cards Saved" value={stats.cards} unit="Cards" art={artCards} tone="rose" />
        </div>

        <h2 className="mt-9 text-[19px] text-ink">Continue Reading</h2>
        <div className="mt-3 flex gap-4">
          {current ? (
            <ContinueCard book={current} />
          ) : (
            <EmptyState className="h-[210px] w-[320px] bg-sand">
              {loading ? 'Loading…' : 'Add a book to start reading'}
            </EmptyState>
          )}
          <Link
            to="/add"
            aria-label="Add a book"
            className="flex h-[210px] w-[158px] items-center justify-center bg-sand text-cream transition hover:bg-sand/80"
          >
            <Icon name="plus" size={54} strokeWidth={2} />
          </Link>
        </div>

        <h2 className="mt-9 text-[19px] text-ink">Recent Activity</h2>
        <div className="mt-3">
          {recent.length ? (
            <div className="flex items-start gap-5 overflow-x-auto pb-2">
              {recent.map(book => (
                <BookTile key={book.id} book={book} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <EmptyState className="h-[170px]">
              Added books and recent activity will appear here
            </EmptyState>
          )}
          <Shelf className="mt-1" />
        </div>
      </div>

      <aside className="hidden w-[320px] shrink-0 pt-9 xl:block">
        <div className="flex max-h-[calc(100vh-120px)] flex-col bg-sand p-4">
          <h2 className="text-[19px] text-ink">Pinned Cards</h2>

          {pinned.length ? (
            <div className="scroll-slim mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
              {pinned.map(card => (
                <VocabCard key={card.id} card={card} onTogglePin={togglePin} compact />
              ))}
            </div>
          ) : (
            <EmptyState tinted className="mt-3 min-h-[420px] flex-1">
              Pinned cards will appear here
            </EmptyState>
          )}

          <Link to="/cards/all" className="mt-4 self-center text-[13px] text-ink underline">
            View All Cards
          </Link>
        </div>
      </aside>
    </div>
  )
}

function ContinueCard({ book }: { book: Book }) {
  const progress = bookProgress(book)
  return (
    <Link to={`/read/${book.id}`} className="flex w-[320px] gap-4 bg-sand p-3 transition hover:bg-sand/85">
      <div className="h-[186px] w-[136px] shrink-0 overflow-hidden shadow-card">
        <BookCover book={book} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-display text-[16px] font-bold leading-tight text-ink">
          {bookTitle(book)}
        </p>
        {book.author && <p className="mt-0.5 text-[11px] text-ink-soft">{book.author}</p>}
        <span className="mt-2 self-start rounded-xs bg-white px-2 py-1 text-[11px] text-ink">
          {languageLabel(book.language)}
        </span>

        <div className="mt-auto">
          <div className="h-3 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-peri" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-[12px] text-ink">{progress}% Complete</p>
        </div>
      </div>
    </Link>
  )
}
