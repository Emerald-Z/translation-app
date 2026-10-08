import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CardGrid from '../../components/CardGrid'
import Icon from '../../components/Icon'
import AddFromSavedModal from '../../components/AddFromSavedModal'
import VocabCard from '../../components/VocabCard'
import {
  addCardsToCollection, listCollectionCardIds, listCollections,
  removeCardFromCollection, type Collection,
} from '../../lib/collections'
import { useCards } from './cardsContext'

export default function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const { cards, loading, togglePin, patchCard, removeCard } = useCards()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!collectionId) return
    listCollections()
      .then(cs => setCollection(cs.find(c => c.id === collectionId) ?? null))
      .catch(() => {})
    listCollectionCardIds(collectionId).then(setMemberIds).catch(() => {})
  }, [collectionId])

  const members = useMemo(
    () => cards.filter(c => memberIds.includes(c.id)),
    [cards, memberIds]
  )
  const candidates = useMemo(
    () => cards.filter(c => !memberIds.includes(c.id)),
    [cards, memberIds]
  )

  async function handleAdd(ids: string[]) {
    if (!collectionId) return
    await addCardsToCollection(collectionId, ids)
    setMemberIds(prev => [...prev, ...ids])
    setAdding(false)
  }

  async function handleRemove(cardId: string) {
    if (!collectionId) return
    await removeCardFromCollection(collectionId, cardId)
    setMemberIds(prev => prev.filter(id => id !== cardId))
  }

  return (
    <div>
      <Link to="/cards/collections" className="text-[13px] text-ink underline">
        ← All collections
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[22px] font-bold text-ink">
            {collection?.name ?? 'Collection'}
          </h2>
          <p className="text-[13px] text-ink-soft">{members.length} cards saved</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-secondary flex items-center gap-1.5"
        >
          <Icon name="plus" size={14} strokeWidth={2} />
          Add from Saved
        </button>
      </div>

      <div className="mt-5">
        {members.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map(card => (
              <div key={card.id} className="relative">
                <VocabCard
                  card={card}
                  onTogglePin={togglePin}
                  onChanged={patch => patchCard(card.id, patch)}
                  onDeleted={() => removeCard(card.id)}
                />
                <button
                  onClick={() => handleRemove(card.id)}
                  aria-label="Remove from collection"
                  className="absolute right-2 top-2 text-ink-soft transition hover:text-heart"
                >
                  <Icon name="close" size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <CardGrid
            cards={[]}
            onTogglePin={togglePin}
            empty={loading ? 'Loading…' : 'Add saved cards to build this collection'}
          />
        )}
      </div>

      {adding && (
        <AddFromSavedModal
          cards={candidates}
          onTogglePin={togglePin}
          onCancel={() => setAdding(false)}
          onDone={handleAdd}
        />
      )}
    </div>
  )
}
