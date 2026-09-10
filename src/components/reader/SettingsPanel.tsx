import Icon from '../Icon'
import {
  HIGHLIGHT_COLORS, type PageLayout, type PageTheme, type ReaderSettings,
} from '../../lib/readerSettings'

interface Props {
  settings: ReaderSettings
  update: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, update, onClose }: Props) {
  return (
    <aside className="scroll-slim absolute right-0 top-0 z-30 h-full w-[340px] overflow-y-auto bg-white px-6 py-6 shadow-panel">
      <div className="flex items-center gap-2">
        <Icon name="settings" size={26} filled className="text-ink" />
        <h2 className="font-display text-[22px] font-bold text-ink">Settings</h2>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-peri-soft text-ink"
        >
          <Icon name="close" size={12} strokeWidth={2.2} />
        </button>
      </div>

      <Section label="Font Size">
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as const).map(scale => (
            <Segment
              key={scale}
              active={settings.fontScale === scale}
              onClick={() => update('fontScale', scale)}
            >
              <span style={{ fontSize: 11 + scale * 4 }}>Aa</span>
            </Segment>
          ))}
        </div>
      </Section>

      <Section label="Brightness">
        <Slider min={60} max={120} value={settings.brightness}
          onChange={v => update('brightness', v)} />
      </Section>

      <Section label="Page Size">
        <Slider min={60} max={180} value={Math.round(settings.pageScale * 100)}
          onChange={v => update('pageScale', v / 100)} />
      </Section>

      <Section label="Theme">
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'sepia', 'dark'] as PageTheme[]).map(theme => (
            <Segment key={theme} active={settings.theme === theme}
              onClick={() => update('theme', theme)}>
              <span className="capitalize">{theme}</span>
            </Segment>
          ))}
        </div>
      </Section>

      <Section label="Layout">
        <div className="grid grid-cols-2 gap-2">
          {(['single', 'continuous'] as PageLayout[]).map(layout => (
            <Segment key={layout} active={settings.layout === layout}
              onClick={() => update('layout', layout)}>
              <span className="capitalize">{layout === 'single' ? 'Single Page' : 'Continuous'}</span>
            </Segment>
          ))}
        </div>
      </Section>

      <Section label="Highlight Color">
        <div className="grid grid-cols-5 gap-2">
          {HIGHLIGHT_COLORS.map(color => (
            <button
              key={color}
              onClick={() => update('highlightColor', color)}
              aria-label={`Highlight colour ${color}`}
              className={`h-[42px] rounded-xs transition ${
                settings.highlightColor === color ? 'ring-2 ring-ink' : 'hover:opacity-80'
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
      </Section>

      <div className="mt-7 flex items-center justify-between">
        <span className="text-[17px] text-ink">Progress</span>
        <Toggle value={settings.showProgress} onChange={v => update('showProgress', v)} />
      </div>
    </aside>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-7">
      <p className="mb-2 text-[17px] text-ink">{label}</p>
      {children}
    </div>
  )
}

function Segment({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-[46px] items-center justify-center rounded-xs text-[13px] transition
        ${active ? 'bg-peri text-white' : 'bg-sand text-ink hover:bg-sand/70'}`}
    >
      {children}
    </button>
  )
}

function Slider({
  min, max, value, onChange,
}: { min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(min, value - 10))} aria-label="Decrease"
        className="text-lg leading-none text-ink">−</button>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-peri-soft
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-peri
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-peri"
      />
      <button onClick={() => onChange(Math.min(max, value + 10))} aria-label="Increase"
        className="text-lg leading-none text-ink">+</button>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className="relative flex h-8 w-[104px] items-center rounded-full bg-peri-soft text-[12px]"
    >
      <span
        className={`absolute top-0 h-8 w-[52px] rounded-full bg-ink transition-all ${
          value ? 'left-[52px]' : 'left-0'
        }`}
      />
      <span className={`relative z-10 w-[52px] text-center ${value ? 'text-ink' : 'text-white'}`}>OFF</span>
      <span className={`relative z-10 w-[52px] text-center ${value ? 'text-white' : 'text-ink'}`}>ON</span>
    </button>
  )
}
