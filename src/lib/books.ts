import { supabase, isMissingSchema, type Book, type ReadingMode } from './supabase'
export type { Book, ReadingMode } from './supabase'

export interface NewBookDetails {
  title: string
  author: string
  language: string
  translationLanguage: string
  readingMode: ReadingMode
}

/** Display title: the designer's book title, falling back to the file name. */
export function bookTitle(book: Book): string {
  const t = book.title?.trim()
  if (t) return t
  return book.filename.replace(/\.[a-z0-9]+$/i, '')
}

export function bookProgress(book: Book): number {
  if (!book.total_pages) return 0
  return Math.min(100, Math.round((book.last_page / book.total_pages) * 100))
}

export function readingMode(book: Book): ReadingMode {
  return book.reading_mode ?? 'highlight'
}

/**
 * Insert a row, retrying without the migration-0001 columns if the database
 * has not been migrated yet.
 */
async function insertBook(full: Record<string, unknown>, legacy: Record<string, unknown>) {
  const first = await supabase.from('books').insert(full).select().single()
  if (!first.error) return first.data as Book
  if (!isMissingSchema(first.error)) throw first.error

  const retry = await supabase.from('books').insert(legacy).select().single()
  if (retry.error) throw retry.error
  return retry.data as Book
}

export async function uploadBook(
  file: File,
  details: NewBookDetails,
  cover?: File | null
): Promise<Book> {
  const path = `${crypto.randomUUID()}.pdf`

  const { error: uploadError } = await supabase.storage.from('pdfs').upload(path, file)
  if (uploadError) throw uploadError

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let coverPath: string | null = null
  if (cover) {
    const cp = `${crypto.randomUUID()}-${cover.name.replace(/[^\w.-]/g, '')}`
    const { error } = await supabase.storage.from('covers').upload(cp, cover)
    if (!error) coverPath = cp
  }

  const legacy = {
    filename: file.name,
    storage_path: path,
    user_id: user.id,
    language: details.language,
  }

  return insertBook(
    {
      ...legacy,
      title: details.title || file.name.replace(/\.[a-z0-9]+$/i, ''),
      author: details.author || null,
      translation_language: details.translationLanguage,
      reading_mode: details.readingMode,
      favorite: false,
      cover_path: coverPath,
    },
    legacy
  )
}

export async function listBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Book[]
}

export async function getBook(id: string): Promise<Book> {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
  if (error) throw error
  return data as Book
}

export async function getBookUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .createSignedUrl(storagePath, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export function coverUrl(book: Book): string | null {
  if (!book.cover_path) return null
  return supabase.storage.from('covers').getPublicUrl(book.cover_path).data.publicUrl
}

/** Best-effort update: silently drops fields the database does not have yet. */
async function patchBook(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('books').update(patch).eq('id', id)
  if (error && !isMissingSchema(error)) throw error
  return !error
}

export async function saveLastPage(id: string, page: number, totalPages?: number) {
  await patchBook(id, {
    last_page: page,
    ...(totalPages ? { total_pages: totalPages } : {}),
  })
  await patchBook(id, { last_opened_at: new Date().toISOString() })
}

export async function setFavorite(id: string, favorite: boolean) {
  return patchBook(id, { favorite })
}

export async function setReadingMode(id: string, mode: ReadingMode) {
  return patchBook(id, { reading_mode: mode })
}

export async function setTranslationLanguage(id: string, language: string) {
  return patchBook(id, { translation_language: language })
}

export async function updateBookDetails(
  id: string,
  patch: { title?: string; author?: string; language?: string; translation_language?: string }
) {
  return patchBook(id, patch)
}

export async function deleteBook(id: string, storagePath: string) {
  await supabase.storage.from('pdfs').remove([storagePath])
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) throw error
}
