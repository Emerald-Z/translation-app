import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CardGrid from '../../components/CardGrid'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import VocabCard from '../../components/VocabCard'
import {
  addCardsToCollection, listCollectionCardIds, listCollections,
  removeCardFromCollection, type Collection,
} from '../../lib/collections'
import { useCards } from './cardsContext'

export default function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const { cards, loading, togglePin } = useCards()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

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

  async function handleAdd() {
    if (!collectionId) return
    const ids = [...selected]
    await addCardsToCollection(collectionId, ids)
    setMemberIds(prev => [...prev, ...ids])
    setSelected(new Set())
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
                <VocabCard card={card} onTogglePin={togglePin} />
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
        <Modal title="Add from Saved" width={640} onClose={() => setAdding(false)}>
          <div className="scroll-slim max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {candidates.length ? (
              candidates.map(card => {
                const checked = selected.has(card.id)
                return (
                  <label
                    key={card.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xs bg-white p-3"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelected(prev => {
                          const next = new Set(prev)
                          checked ? next.delete(card.id) : next.add(card.id)
                          return next
                        })
                      }
                      className="mt-1 accent-[#6A7CB9]"
                    />
                    <span className="min-w-0">
                      <span className="block text-[15px] text-ink">{card.text}</span>
                      <span className="block text-[12px] italic text-ink-soft">
                        {card.translation_override ?? card.translation}
                      </span>
                      <span className="block text-[11px] text-ink-soft">
                        {card.book_title} • pg. {card.page_number}
                      </span>
                    </span>
                  </label>
                )
              })
            ) : (
              <p className="py-8 text-center text-sm text-ink-soft">
                Every saved card is already in this collection.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAdd} disabled={!selected.size} className="btn-primary">
              Add {selected.size || ''} {selected.size === 1 ? 'card' : 'cards'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
