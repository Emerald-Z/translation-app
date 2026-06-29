import { supabase } from './supabase'

export interface Highlight {
  id: string
  book_id: string
  page_number: number
  text: string
  pinyin: string
  translation: string
  translation_override: string | null
  notes: string | null
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
  translation_override: string | null
  notes: string | null
  language: string
  count: number
}

export async function saveHighlight(data: Omit<Highlight, 'id' | 'created_at' | 'user_id' | 'translation_override' | 'notes'>): Promise<Highlight> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: row, error } = await supabase
    .from('highlights')
    .insert({ ...data, user_id: user.id })
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
    .select('text, pinyin, translation, translation_override, notes, books(language)')
    .order('created_at', { ascending: false })
  if (error) throw error

  const map = new Map<string, DictionaryEntry>()
  for (const h of (data as unknown as (Pick<Highlight, 'text' | 'pinyin' | 'translation' | 'translation_override' | 'notes'> & { books: { language: string } | null })[])) {
    const language = h.books?.language ?? 'unknown'
    if (map.has(h.text)) {
      map.get(h.text)!.count++
      if (!map.get(h.text)!.translation_override && h.translation_override)
        map.get(h.text)!.translation_override = h.translation_override
      if (!map.get(h.text)!.notes && h.notes)
        map.get(h.text)!.notes = h.notes
    } else {
      map.set(h.text, {
        text: h.text,
        pinyin: h.pinyin,
        translation: h.translation,
        translation_override: h.translation_override,
        notes: h.notes,
        language,
        count: 1,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

export async function updateHighlightsByText(
  text: string,
  updates: { translation_override: string | null; notes: string | null }
) {
  const { error } = await supabase
    .from('highlights')
    .update(updates)
    .eq('text', text)
  if (error) throw error
}

export async function deleteHighlightsByText(text: string) {
  const { error } = await supabase.from('highlights').delete().eq('text', text)
  if (error) throw error
}
