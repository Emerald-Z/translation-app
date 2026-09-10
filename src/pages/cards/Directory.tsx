import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BookCardTile from '../../components/BookCardTile'
import CollectionTile from '../../components/CollectionTile'
import EmptyState from '../../components/EmptyState'
import LanguageTile from '../../components/LanguageTile'
import VocabCard from '../../components/VocabCard'
import { groupByBook, groupByLanguage } from '../../lib/cards'
import { listCollections, type Collection } from '../../lib/collections'
import { useCards } from './cardsContext'

export default function Directory() {
  const { cards, books, loading, togglePin } = useCards()
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => { listCollections().then(setCollections).catch(() => {}) }, [])

  const pinned = cards.filter(c => c.pinned)
  const byLanguage = useMemo(() => groupByLanguage(cards).slice(0, 4), [cards])
  const byBook = useMemo(() => groupByBook(cards).slice(0, 4), [cards])
  const bookById = useMemo(() => new Map(books.map(b => [b.id, b])), [books])

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-[17px] text-ink">Pinned Cards</h2>
        <Link to="/cards/all" className="text-[12px] text-ink underline">View all cards</Link>
      </div>

      {pinned.length ? (
        <div className="mt-2 flex gap-4 overflow-x-auto pb-2">
          {pinned.map(card => (
            <div key={card.id} className="w-[262px] shrink-0">
              <VocabCard card={card} onTogglePin={togglePin} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState tinted className="mt-2 h-[86px]">
          {loading ? 'Loading…' : 'Pinned cards will appear here'}
        </EmptyState>
      )}

      <h2 className="mt-9 text-[19px] text-ink">All Titles</h2>

      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="bg-sand p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[17px] text-ink">Cards By Language</h3>
            <Link to="/cards/language" className="text-[12px] text-ink underline">View All</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {byLanguage.length ? (
              byLanguage.map((group, i) => (
                <LanguageTile key={group.key} code={group.key} count={group.count} index={i} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-ink-soft">No cards saved yet</p>
            )}
          </div>
        </section>

        <section className="bg-sand p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[17px] text-ink">Cards By Book</h3>
            <Link to="/cards/book" className="text-[12px] text-ink underline">View All</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {byBook.length ? (
              byBook.map(group => {
                const book = bookById.get(group.key)
                return book
                  ? <BookCardTile key={group.key} book={book} count={group.count} />
                  : null
              })
            ) : (
              <p className="py-8 text-center text-sm text-ink-soft">No cards saved yet</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-9 flex items-baseline justify-between">
        <h2 className="text-[19px] text-ink">My Card Collections</h2>
        <Link to="/cards/collections" className="text-[12px] text-ink underline">
          View all collections
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {collections.length ? (
          collections.slice(0, 4).map(collection => (
            <CollectionTile key={collection.id} collection={collection} />
          ))
        ) : (
          <EmptyState tinted className="col-span-full h-[120px]">
            Grouped card collections will appear here
          </EmptyState>
        )}
      </div>
    </div>
  )
}
