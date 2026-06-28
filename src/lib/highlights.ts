import { supabase } from './supabase'

export interface Highlight {
  id: string
  book_id: string
  page_number: number
  text: string
  pinyin: string
  translation: string
  x: number
  y: number
  width: number
  height: number
  created_at: string
}

export interface DictionaryEntry {
  text: string
  pinyin: string
  translation: string
  count: number
}

export async function saveHighlight(data: Omit<Highlight, 'id' | 'created_at'>): Promise<Highlight> {
  const { data: row, error } = await supabase
    .from('highlights')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as Highlight
}

export async function getBookHighlights(bookId: string): Promise<Highlight[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('book_id', bookId)
  if (error) throw error
  return data as Highlight[]
}

export async function getDictionaryEntries(): Promise<DictionaryEntry[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select('text, pinyin, translation')
  if (error) throw error

  const map = new Map<string, DictionaryEntry>()
  for (const h of data as { text: string; pinyin: string; translation: string }[]) {
    if (map.has(h.text)) {
      map.get(h.text)!.count++
    } else {
      map.set(h.text, { text: h.text, pinyin: h.pinyin, translation: h.translation, count: 1 })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

export async function deleteHighlightsByText(text: string) {
  const { error } = await supabase.from('highlights').delete().eq('text', text)
  if (error) throw error
}
