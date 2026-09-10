import { useCallback, useEffect, useState } from 'react'

export type PageTheme = 'light' | 'sepia' | 'dark'
export type PageLayout = 'single' | 'continuous'

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

export const HIGHLIGHT_COLORS = [
  '#FDE68A', '#FCA5A5', '#A7F3D0', '#BFDBFE', '#DDD6FE',
  '#FBCFE8', '#FED7AA', '#D9F99D', '#CBD1E3', '#E5E7EB',
]

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontScale: 1,
  brightness: 100,
  pageScale: 1,
  theme: 'light',
  layout: 'single',
  highlightColor: HIGHLIGHT_COLORS[0],
  showProgress: true,
  phonetics: true,
}

const KEY = 'lingomous.reader'

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
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
