import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import BookCardTile from '../../components/BookCardTile'
import CardGrid from '../../components/CardGrid'
import EmptyState from '../../components/EmptyState'
import { bookTitle } from '../../lib/books'
import { groupByBook } from '../../lib/cards'
import { useCards } from './cardsContext'

export default function ByBook() {
  const { bookId } = useParams<{ bookId?: string }>()
  const { cards, books, loading, togglePin } = useCards()
  const groups = useMemo(() => groupByBook(cards), [cards])
  const bookById = useMemo(() => new Map(books.map(b => [b.id, b])), [books])

  if (bookId) {
    const group = groups.find(g => g.key === bookId)
    const book = bookById.get(bookId)
    return (
      <div>
        <h2 className="font-display text-[22px] font-bold text-ink">
          {book ? bookTitle(book) : group?.label ?? 'Book'}
        </h2>
        <p className="mb-4 text-[13px] text-ink-soft">{group?.count ?? 0} cards saved</p>
        <CardGrid
          cards={group?.items ?? []}
          onTogglePin={togglePin}
          empty={loading ? 'Loading…' : 'No cards saved from this book yet'}
        />
      </div>
    )
  }

  return groups.length ? (
    <div className="flex flex-wrap gap-4">
      {groups.map(group => {
        const book = bookById.get(group.key)
        return book ? <BookCardTile key={group.key} book={book} count={group.count} /> : null
      })}
    </div>
  ) : (
    <EmptyState tinted className="h-[86px]">
      {loading ? 'Loading…' : 'Collections by book will appear here'}
    </EmptyState>
  )
}
