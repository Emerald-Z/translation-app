import CollectionTile from './CollectionTile'
import Icon from './Icon'
import type { Collection } from '../lib/collections'

interface Props {
  collection: Collection
  onClose: () => void
}

/** Confirmation after a collection is created, previewing its new tile. */
export default function CollectionCreated({ collection, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-[638px] rounded-xs bg-white px-10 py-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-peri-soft text-ink"
        >
          <Icon name="close" size={12} strokeWidth={2.2} />
        </button>

        <div className="mx-auto w-[290px]">
          <CollectionTile collection={collection} to={null} />
        </div>

        <p className="mt-6 text-center text-[17px] text-ink">
          Your new card collection has been created
        </p>
      </div>
    </div>
  )
}
