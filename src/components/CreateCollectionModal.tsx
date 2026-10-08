import { useRef, useState } from 'react'
import Icon from './Icon'

interface Props {
  initialName?: string
  heading?: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: (name: string, cover: File | null) => void
}

/** Name and cover for a collection. "Next" leads on to picking its cards. */
export default function CreateCollectionModal({
  initialName = '', heading = 'Create A New Collection', confirmLabel = 'Next', onCancel, onConfirm,
}: Props) {
  const [name, setName] = useState(initialName)
  const [cover, setCover] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function pick(file: File | undefined) {
    if (!file) return
    setCover(file)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-[640px] overflow-hidden rounded-xs bg-white px-10 py-7">
        <h2 className="text-center text-[22px] text-ink">{heading}</h2>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-6 flex h-[165px] w-full items-center justify-center overflow-hidden rounded-xs bg-sand-soft transition hover:opacity-90"
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-ink-soft">
              <Icon name="upload" size={30} strokeWidth={1.5} />
              <span className="text-[13px]">Choose a cover image</span>
            </span>
          )}
        </button>
        <input
          ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => pick(e.target.files?.[0])}
        />

        <label className="mt-6 block text-[17px] text-ink" htmlFor="cc-name">
          Collection Name
        </label>
        <input
          id="cc-name"
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim(), cover) }}
          placeholder="Flowery References"
          className="mt-1 w-full rounded-xs bg-[#E9EBF3] px-4 py-2.5 text-[15px] text-ink
            placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-peri"
        />

        <div className="mt-7 flex justify-center gap-4">
          <button onClick={onCancel} className="btn-secondary px-14">Cancel</button>
          <button
            onClick={() => onConfirm(name.trim(), cover)}
            disabled={!name.trim()}
            className="btn-secondary px-16"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
