import { useCallback, useEffect, useState } from 'react'

export type PageTheme = 'light' | 'sepia' | 'dark'
export type PageLayout = 'scrolling' | 'single'

export interface ReaderSettings {
  fontScale: 0 | 1 | 2
  brightness: number   // 60–120, applied as a filter on the page
  pageScale: number    // 0.6–1.8 render width multiplier
  theme: PageTheme
  layout: PageLayout
  highlightColor: string
  showProgress: boolean
  phonetics: boolean
}

/** The ten swatches in the design's Highlight Color grid, in order. */
export const HIGHLIGHT_COLORS = [
  '#E89C9C', '#E8B59C', '#E8D59C', '#B4CBA4', '#A4CBC6',
  '#A2B8DD', '#B9ADDC', '#CF9CC1', '#C7B19B', '#CFCFCF',
]

/** Swatch fills for the Theme control, which previews each theme's paper. */
export const THEME_SWATCH: Record<PageTheme, { bg: string; text: string }> = {
  light: { bg: '#F4F2E7', text: '#2F3F75' },
  sepia: { bg: '#DDD8C4', text: '#2F3F75' },
  dark: { bg: '#2F3F75', text: '#FFFFFF' },
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontScale: 1,
  brightness: 100,
  pageScale: 1,
  theme: 'light',
  layout: 'scrolling',
  highlightColor: HIGHLIGHT_COLORS[2],
  showProgress: true,
  phonetics: true,
}

const KEY = 'lingomous.reader'

/**
 * Brings a stored blob up to date. The layout options were renamed, and the
 * highlight palette was replaced, so older values would otherwise persist as
 * an unselectable swatch.
 */
function migrate(stored: Partial<ReaderSettings> & { layout?: string }): ReaderSettings {
  const merged = { ...DEFAULT_SETTINGS, ...stored } as ReaderSettings
  if ((stored.layout as string) === 'continuous') merged.layout = 'scrolling'
  if (!HIGHLIGHT_COLORS.includes(merged.highlightColor)) {
    merged.highlightColor = DEFAULT_SETTINGS.highlightColor
  }
  return merged
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      return migrate(JSON.parse(localStorage.getItem(KEY) ?? '{}'))
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch { /* ignore */ }
  }, [settings])

  const update = useCallback(
    <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) =>
      setSettings(s => ({ ...s, [key]: value })),
    []
  )

  return { settings, update }
}
