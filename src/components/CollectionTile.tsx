import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import type { Collection } from '../lib/collections'

interface Props {
  collection: Collection
  onRename?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
}

export default function CollectionTile({ collection, onRename, onDelete }: Props) {
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative">
      <Link
        to={`/cards/collections/${collection.id}`}
        className="flex h-[128px] flex-col justify-end bg-gradient-to-b from-[#C9C7C2] to-[#AFAEA9] p-3 shadow-card transition hover:opacity-95"
      >
        <p className="truncate font-display text-[17px] font-bold text-white">{collection.name}</p>
        <p className="text-[12px] text-white/90">{collection.card_count} cards saved</p>
      </Link>

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
            <div className="absolute right-0 top-6 z-30 w-[150px] rounded-xs bg-white p-1.5 shadow-panel">
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
