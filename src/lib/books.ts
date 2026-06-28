import { supabase } from './supabase'
export type { Book } from './supabase'
import type { Book } from './supabase'

export async function uploadBook(file: File): Promise<Book> {
  const path = `${crypto.randomUUID()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(path, file)
  if (uploadError) throw uploadError

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error: insertError } = await supabase
    .from('books')
    .insert({ filename: file.name, storage_path: path, user_id: user.id })
    .select()
    .single()
  if (insertError) throw insertError

  return data as Book
}

export async function listBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Book[]
}

export async function getBookUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .createSignedUrl(storagePath, 60 * 60) // 1 hour
  if (error) throw error
  return data.signedUrl
}

export async function saveLastPage(id: string, page: number, totalPages?: number) {
  await supabase
    .from('books')
    .update({ last_page: page, ...(totalPages ? { total_pages: totalPages } : {}) })
    .eq('id', id)
}

export async function deleteBook(id: string, storagePath: string) {
  await supabase.storage.from('pdfs').remove([storagePath])
  await supabase.from('books').delete().eq('id', id)
}
