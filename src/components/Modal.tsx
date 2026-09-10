import { useEffect } from 'react'
import Icon from './Icon'

interface Props {
  title?: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, width = 640 }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full rounded-xs bg-sand p-7 shadow-panel"
        style={{ maxWidth: width }}
      >
        {title && <h2 className="mb-5 font-display text-xl font-bold text-ink">{title}</h2>}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-ink transition hover:bg-white"
        >
          <Icon name="close" size={14} strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  )
}
