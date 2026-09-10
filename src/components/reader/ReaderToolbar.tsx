import Icon from '../Icon'

interface Props {
  page: number
  totalPages: number
  onPage: (page: number) => void
  phonetics: boolean
  onTogglePhonetics: () => void
  settingsOpen: boolean
  onToggleSettings: () => void
}

/** The floating khaki toolbar pinned to the bottom of the reading surface. */
export default function ReaderToolbar({
  page, totalPages, onPage, phonetics, onTogglePhonetics, settingsOpen, onToggleSettings,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
      <div className="pointer-events-auto flex h-[54px] w-[640px] max-w-[92%] items-center gap-4 rounded-t-xs bg-toolbar px-6 shadow-panel">
        <button
          onClick={onTogglePhonetics}
          aria-label="Toggle pronunciation guides"
          aria-pressed={phonetics}
          className={`transition ${phonetics ? 'text-ink' : 'text-ink/40 hover:text-ink/70'}`}
        >
          <Icon name="glasses" size={28} />
        </button>

        <div className="mx-auto flex items-center gap-3">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="text-ink transition disabled:opacity-30"
          >
            <Triangle direction="left" />
          </button>

          <input
            type="number"
            min={1}
            max={totalPages || 1}
            value={page}
            onChange={e => {
              const next = Number(e.target.value)
              if (Number.isFinite(next)) onPage(next)
            }}
            aria-label="Page number"
            className="h-7 w-[52px] rounded-xs border border-line bg-white text-center text-[13px] text-ink focus:border-peri focus:outline-none"
          />
          <span className="text-[13px] text-ink">of {totalPages || '—'}</span>

          <button
            onClick={() => onPage(page + 1)}
            disabled={!totalPages || page >= totalPages}
            aria-label="Next page"
            className="text-ink transition disabled:opacity-30"
          >
            <Triangle direction="right" />
          </button>
        </div>

        <button
          onClick={onToggleSettings}
          aria-label="Reading settings"
          aria-pressed={settingsOpen}
          className={`transition ${settingsOpen ? 'text-peri' : 'text-ink hover:text-peri'}`}
        >
          <Icon name="settings" size={26} filled />
        </button>
      </div>
    </div>
  )
}

function Triangle({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
      {direction === 'left' ? <path d="M15 1 1 9l14 8z" /> : <path d="M1 1l14 8-14 8z" />}
    </svg>
  )
}
