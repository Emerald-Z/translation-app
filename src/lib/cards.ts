import { supabase, isMissingSchema } from './supabase'

/** A saved word or phrase. Stored in the `highlights` table. */
export interface Card {
  id: string
  book_id: string
  page_number: number
  text: string
  pinyin: string
  translation: string
  translation_override: string | null
  notes: string | null
  pinned: boolean
  x: number
  y: number
  width: number
  height: number
  created_at: string
  /* Denormalised from the joined book row. */
  book_title: string
  book_language: string
}

type JoinedBook = { title: string | null; filename: string; language: string } | null

interface Row extends Omit<Card, 'book_title' | 'book_language' | 'pinned'> {
  pinned?: boolean | null
  books: JoinedBook
}

const SELECT = '*, books(title, filename, language)'
const SELECT_LEGACY = '*, books(filename, language)'

function shape(row: Row): Card {
  const book = row.books
  const title = book?.title?.trim() || book?.filename?.replace(/\.[a-z0-9]+$/i, '') || 'Untitled'
  return {
    ...row,
    pinned: row.pinned ?? false,
    book_title: title,
    book_language: book?.language ?? 'unknown',
  }
}

async function query(build: (select: string) => PromiseLike<{ data: unknown; error: unknown }>) {
  const first = await build(SELECT)
  if (!first.error) return (first.data as Row[]).map(shape)
  if (!isMissingSchema(first.error)) throw first.error

  const retry = await build(SELECT_LEGACY)
  if (retry.error) throw retry.error
  return (retry.data as Row[]).map(shape)
}

export async function listCards(): Promise<Card[]> {
  return query(select =>
    supabase.from('highlights').select(select).order('created_at', { ascending: false })
  )
}

export async function listBookCards(bookId: string): Promise<Card[]> {
  return query(select =>
    supabase
      .from('highlights')
      .select(select)
      .eq('book_id', bookId)
      .order('page_number', { ascending: true })
  )
}

export async function listPinnedCards(limit = 12): Promise<Card[]> {
  const all = await listCards()
  return all.filter(c => c.pinned).slice(0, limit)
}

export async function saveCard(
  data: Pick<Card, 'book_id' | 'page_number' | 'text' | 'pinyin' | 'translation' | 'x' | 'y' | 'width' | 'height'>
): Promise<Card> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const insert = async (select: string) =>
    supabase.from('highlights').insert({ ...data, user_id: user.id }).select(select).single()

  let res = await insert(SELECT)
  if (res.error && isMissingSchema(res.error)) res = await insert(SELECT_LEGACY)
  if (res.error) throw res.error
  return shape(res.data as unknown as Row)
}

export async function setPinned(id: string, pinned: boolean): Promise<boolean> {
  const { error } = await supabase.from('highlights').update({ pinned }).eq('id', id)
  if (error && !isMissingSchema(error)) throw error
  return !error
}

export async function updateCard(
  id: string,
  patch: { translation_override?: string | null; notes?: string | null }
) {
  const { error } = await supabase.from('highlights').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCard(id: string) {
  const { error } = await supabase.from('highlights').delete().eq('id', id)
  if (error) throw error
}

/* ── grouping helpers used by the Cards section ───────────────────────── */

export interface Group<T> {
  key: string
  label: string
  count: number
  items: T[]
  meta?: Record<string, unknown>
}

export function groupByLanguage(cards: Card[]): Group<Card>[] {
  const map = new Map<string, Card[]>()
  for (const c of cards) {
    const list = map.get(c.book_language) ?? []
    list.push(c)
    map.set(c.book_language, list)
  }
  return [...map.entries()]
    .map(([key, items]) => ({ key, label: key, count: items.length, items }))
    .sort((a, b) => b.count - a.count)
}

export function groupByBook(cards: Card[]): Group<Card>[] {
  const map = new Map<string, Card[]>()
  for (const c of cards) {
    const list = map.get(c.book_id) ?? []
    list.push(c)
    map.set(c.book_id, list)
  }
  return [...map.entries()]
    .map(([key, items]) => ({
      key,
      label: items[0].book_title,
      count: items.length,
      items,
    }))
    .sort((a, b) => b.count - a.count)
}
