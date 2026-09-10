import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CardGrid from '../../components/CardGrid'
import EmptyState from '../../components/EmptyState'
import LanguageTile from '../../components/LanguageTile'
import { groupByLanguage } from '../../lib/cards'
import { languageLabel } from '../../lib/languages'
import { useCards } from './cardsContext'

export default function ByLanguage() {
  const { code } = useParams<{ code?: string }>()
  const { cards, loading, togglePin } = useCards()
  const groups = useMemo(() => groupByLanguage(cards), [cards])

  if (code) {
    const group = groups.find(g => g.key === code)
    return (
      <div>
        <h2 className="font-display text-[22px] font-bold text-ink">{languageLabel(code)}</h2>
        <p className="mb-4 text-[13px] text-ink-soft">{group?.count ?? 0} cards saved</p>
        <CardGrid
          cards={group?.items ?? []}
          onTogglePin={togglePin}
          empty={loading ? 'Loading…' : 'No cards saved in this language yet'}
        />
      </div>
    )
  }

  return groups.length ? (
    <div className="flex flex-wrap gap-4">
      {groups.map((group, i) => (
        <LanguageTile key={group.key} code={group.key} count={group.count} index={i} />
      ))}
    </div>
  ) : (
    <EmptyState tinted className="h-[86px]">
      {loading ? 'Loading…' : 'Collections by language will appear here'}
    </EmptyState>
  )
}
