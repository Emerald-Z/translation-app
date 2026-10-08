import { useEffect, useState } from 'react'
import AddFromSavedModal from '../../components/AddFromSavedModal'
import CollectionCreated from '../../components/CollectionCreated'
import CollectionTile from '../../components/CollectionTile'
import CreateCollectionModal from '../../components/CreateCollectionModal'
import EmptyState from '../../components/EmptyState'
import Icon from '../../components/Icon'
import {
  addCardsToCollection, collectionsUnavailable, createCollection, deleteCollection,
  listCollections, renameCollection, uploadCollectionCover, type Collection,
} from '../../lib/collections'
import { useCards } from './cardsContext'

/** The create flow runs name and cover, then card picking, then confirmation. */
type Stage =
  | { step: 'idle' }
  | { step: 'naming' }
  | { step: 'picking'; collection: Collection }
  | { step: 'created'; collection: Collection }
  | { step: 'renaming'; collection: Collection }

export default function Collections() {
  const { cards, togglePin } = useCards()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState<Stage>({ step: 'idle' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCollections()
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(name: string, cover: File | null) {
    setError(null)
    const coverPath = cover ? await uploadCollectionCover(cover) : null
    const created = await createCollection(name, coverPath)
    if (!created) {
      setError('Collections need the tables from migration 0001. Run it to start grouping cards.')
      setStage({ step: 'idle' })
      return
    }
    setCollections(cs => [created, ...cs])
    setStage({ step: 'picking', collection: created })
  }

  async function handlePicked(collection: Collection, cardIds: string[]) {
    await addCardsToCollection(collection.id, cardIds)
    const withCount = { ...collection, card_count: cardIds.length }
    setCollections(cs => cs.map(c => (c.id === collection.id ? withCount : c)))
    setStage({ step: 'created', collection: withCount })
  }

  async function handleRename(collection: Collection, name: string) {
    await renameCollection(collection.id, name)
    setCollections(cs => cs.map(c => (c.id === collection.id ? { ...c, name } : c)))
    setStage({ step: 'idle' })
  }

  async function handleDelete(collection: Collection) {
    if (!confirm(`Delete the collection "${collection.name}"? The cards themselves stay saved.`)) return
    await deleteCollection(collection.id)
    setCollections(cs => cs.filter(c => c.id !== collection.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[19px] text-ink">My Card Collections</h2>
        <button
          onClick={() => setStage({ step: 'naming' })}
          className="btn-secondary flex items-center gap-1.5"
        >
          <Icon name="plus" size={14} strokeWidth={2} />
          Create Collection
        </button>
      </div>

      {(error || collectionsUnavailable()) && (
        <p className="mt-4 rounded-xs bg-sand px-3 py-2 text-[13px] text-ink">
          {error ??
            'Collections need the tables from migration 0001. Run it against your Supabase project to start grouping cards.'}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {collections.length ? (
          collections.map(collection => (
            <CollectionTile
              key={collection.id}
              collection={collection}
              onRename={c => setStage({ step: 'renaming', collection: c })}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyState tinted className="col-span-full h-[150px]">
            {loading ? 'Loading…' : 'Your card collections will appear here'}
          </EmptyState>
        )}
      </div>

      {stage.step === 'naming' && (
        <CreateCollectionModal
          onCancel={() => setStage({ step: 'idle' })}
          onConfirm={handleCreate}
        />
      )}

      {stage.step === 'renaming' && (
        <CreateCollectionModal
          heading="Edit Collection"
          confirmLabel="Save"
          initialName={stage.collection.name}
          onCancel={() => setStage({ step: 'idle' })}
          onConfirm={name => handleRename(stage.collection, name)}
        />
      )}

      {stage.step === 'picking' && (
        <AddFromSavedModal
          cards={cards}
          onTogglePin={togglePin}
          onCancel={() => setStage({ step: 'created', collection: stage.collection })}
          onDone={ids => handlePicked(stage.collection, ids)}
        />
      )}

      {stage.step === 'created' && (
        <CollectionCreated
          collection={stage.collection}
          onClose={() => setStage({ step: 'idle' })}
        />
      )}
    </div>
  )
}
