import { useEffect, useState } from 'react'
import CollectionTile from '../../components/CollectionTile'
import EmptyState from '../../components/EmptyState'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import {
  createCollection, deleteCollection, listCollections, renameCollection,
  collectionsUnavailable, type Collection,
} from '../../lib/collections'

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Collection | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    listCollections()
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    const created = await createCollection(trimmed)
    if (created) setCollections(cs => [created, ...cs])
    setCreating(false)
    setName('')
  }

  async function handleRename() {
    if (!renaming) return
    const trimmed = name.trim()
    if (!trimmed) return
    await renameCollection(renaming.id, trimmed)
    setCollections(cs => cs.map(c => (c.id === renaming.id ? { ...c, name: trimmed } : c)))
    setRenaming(null)
    setName('')
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
          onClick={() => { setName(''); setCreating(true) }}
          className="btn-secondary flex items-center gap-1.5"
        >
          <Icon name="plus" size={14} strokeWidth={2} />
          Create Collection
        </button>
      </div>

      {collectionsUnavailable() && (
        <p className="mt-4 rounded-xs bg-sand px-3 py-2 text-[13px] text-ink">
          Collections need the tables from migration 0001. Run it against your Supabase project
          to start grouping cards.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {collections.length ? (
          collections.map(collection => (
            <CollectionTile
              key={collection.id}
              collection={collection}
              onRename={c => { setName(c.name); setRenaming(c) }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyState tinted className="col-span-full h-[130px]">
            {loading ? 'Loading…' : 'Your card collections will appear here'}
          </EmptyState>
        )}
      </div>

      {(creating || renaming) && (
        <Modal
          title={renaming ? 'Edit Collection' : 'Create Collection'}
          width={560}
          onClose={() => { setCreating(false); setRenaming(null) }}
        >
          <label className="mb-1 block text-sm text-ink" htmlFor="collection-name">
            Collection Name
          </label>
          <input
            id="collection-name" className="field" value={name} autoFocus
            placeholder="Travel words"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') renaming ? handleRename() : handleCreate() }}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => { setCreating(false); setRenaming(null) }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={renaming ? handleRename : handleCreate} className="btn-primary">
              {renaming ? 'Save' : 'Create'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
