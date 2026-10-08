import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { collectionCoverUrl, type Collection } from '../lib/collections'

interface Props {
  collection: Collection
  /** Omit to render a non-navigating preview, as in the created confirmation. */
  to?: string | null
  onRename?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
}

export default function CollectionTile({ collection, to, onRename, onDelete }: Props) {
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cover = collectionCoverUrl(collection.cover_path)
  const href = to === undefined ? `/cards/collections/${collection.id}` : to

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const body = (
    <>
      {cover ? (
        <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9C7C2] to-[#AFAEA9]" />
      )}
      {/* The caption sits over a scrim so it stays readable on any cover. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="relative mt-auto p-3">
        <p className="truncate font-display text-[17px] font-bold text-white">{collection.name}</p>
        <p className="text-[12px] text-white/90">{collection.card_count} cards saved</p>
      </div>
    </>
  )

  return (
    <div className="relative">
      {href ? (
        <Link
          to={href}
          className="relative flex h-[150px] flex-col overflow-hidden rounded-md shadow-card transition hover:opacity-95"
        >
          {body}
        </Link>
      ) : (
        <div className="relative flex h-[150px] flex-col overflow-hidden rounded-md shadow-card">
          {body}
        </div>
      )}

      {(onRename || onDelete) && (
        <div ref={ref} className="absolute right-2 top-2">
          <button
            onClick={() => setMenu(m => !m)}
            aria-label="Collection options"
            className="text-white/90 transition hover:text-white"
          >
            <Icon name="dots" size={16} />
          </button>
          {menu && (
            <div className="absolute right-0 top-6 z-30 w-[150px] rounded-md bg-white p-1.5 shadow-panel">
              {onRename && (
                <button
                  onClick={() => { setMenu(false); onRename(collection) }}
                  className="w-full rounded-xs px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                >
                  Rename
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { setMenu(false); onDelete(collection) }}
                  className="w-full rounded-xs px-3 py-2 text-left text-sm text-heart transition hover:bg-cream"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
