import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { listCards, setPinned, type Card } from '../../lib/cards'
import { listBooks, type Book } from '../../lib/books'
import type { CardsContext } from './cardsContext'

const TABS = [
  { to: '/cards', label: 'Card Directory', end: true, lead: true },
  { to: '/cards/all', label: 'All Cards' },
  { to: '/cards/language', label: 'By Language' },
  { to: '/cards/book', label: 'By Book' },
  { to: '/cards/collections', label: 'Collections' },
]

export default function CardsLayout() {
  const [cards, setCards] = useState<Card[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [c, b] = await Promise.all([
      listCards().catch(() => []),
      listBooks().catch(() => []),
    ])
    setCards(c)
    setBooks(b)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const togglePin = useCallback(async (card: Card) => {
    const next = !card.pinned
    setCards(cs => cs.map(c => (c.id === card.id ? { ...c, pinned: next } : c)))
    await setPinned(card.id, next)
  }, [])

  const context: CardsContext = { cards, books, loading, togglePin, reload }

  return (
    <div className="max-w-[1180px]">
      <nav className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `font-display font-bold transition ${tab.lead ? 'text-[26px]' : 'text-[19px]'} ` +
              (isActive ? 'text-ink underline underline-offset-4' : 'text-peri-soft hover:text-peri')
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        <Outlet context={context} />
      </div>
    </div>
  )
}
