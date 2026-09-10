import { useMemo, useState } from 'react'
import CardGrid from '../../components/CardGrid'
import Dropdown from '../../components/Dropdown'
import Icon from '../../components/Icon'
import { bookTitle } from '../../lib/books'
import { languageLabel } from '../../lib/languages'
import { useCards } from './cardsContext'

export default function AllCards() {
  const { cards, books, loading, togglePin } = useCards()
  const [language, setLanguage] = useState('')
  const [bookId, setBookId] = useState('')
  const [search, setSearch] = useState('')

  const languages = useMemo(
    () => [...new Set(cards.map(c => c.book_language))],
    [cards]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cards.filter(card => {
      if (language && card.book_language !== language) return false
      if (bookId && card.book_id !== bookId) return false
      if (!q) return true
      const translation = card.translation_override ?? card.translation
      return (
        card.text.toLowerCase().includes(q) ||
        translation.toLowerCase().includes(q) ||
        card.book_title.toLowerCase().includes(q)
      )
    })
  }, [cards, language, bookId, search])

  const filtering = Boolean(language || bookId || search.trim())

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setLanguage(''); setBookId(''); setSearch('') }}
          className={`rounded-xs px-3 py-1.5 text-[13px] transition ${
            filtering ? 'bg-white text-ink hover:bg-peri-soft' : 'bg-peri-soft text-ink'
          }`}
        >
          All Books
        </button>

        <Dropdown
          value={language} onChange={setLanguage} placeholder="Language"
          options={languages.map(l => ({ value: l, label: languageLabel(l) }))}
          className="w-[132px]"
        />
        <Dropdown
          value={bookId} onChange={setBookId} placeholder="Book"
          options={books.map(b => ({ value: b.id, label: bookTitle(b) }))}
          className="w-[132px]"
        />

        <div className="relative ml-auto w-[380px] max-w-full">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search cards"
            className="field pr-9"
          />
          <Icon
            name="search" size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-[12px] text-ink-soft">
          {search.trim() ? `Results for “${search.trim()}”` : filtering ? 'Filtered results' : ''}
        </p>
        <p className="text-[12px] text-ink">{filtered.length} Cards</p>
      </div>

      <div className="mt-2">
        <CardGrid
          cards={filtered}
          onTogglePin={togglePin}
          empty={loading ? 'Loading…' : 'All cards will appear here'}
        />
      </div>
    </div>
  )
}
