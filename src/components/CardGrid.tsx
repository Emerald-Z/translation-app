import EmptyState from './EmptyState'
import VocabCard from './VocabCard'
import type { Card } from '../lib/cards'

interface Props {
  cards: Card[]
  onTogglePin: (card: Card) => void
  onPatch?: (id: string, patch: Partial<Card>) => void
  onRemove?: (id: string) => void
  empty?: string
}

export default function CardGrid({
  cards, onTogglePin, onPatch, onRemove, empty = 'No cards here yet',
}: Props) {
  if (!cards.length) {
    return <EmptyState tinted className="h-[110px]">{empty}</EmptyState>
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map(card => (
        <VocabCard
          key={card.id}
          card={card}
          onTogglePin={onTogglePin}
          onChanged={onPatch ? patch => onPatch(card.id, patch) : undefined}
          onDeleted={onRemove ? () => onRemove(card.id) : undefined}
        />
      ))}
    </div>
  )
}
