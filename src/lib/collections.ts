import { supabase, isMissingSchema } from './supabase'
import type { Card } from './cards'

export interface Collection {
  id: string
  name: string
  created_at: string
  card_count: number
}

/** Set once a query proves the collections tables are absent. */
let unavailable = false
export const collectionsUnavailable = () => unavailable

export async function listCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, created_at, collection_cards(count)')
    .order('created_at', { ascending: false })

  if (error) {
    if (isMissingSchema(error)) {
      unavailable = true
      return []
    }
    throw error
  }

  return (data as unknown as (Omit<Collection, 'card_count'> & {
    collection_cards: { count: number }[]
  })[]).map(row => ({
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    card_count: row.collection_cards?.[0]?.count ?? 0,
  }))
}

export async function createCollection(name: string): Promise<Collection | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('collections')
    .insert({ name, user_id: user.id })
    .select('id, name, created_at')
    .single()

  if (error) {
    if (isMissingSchema(error)) {
      unavailable = true
      return null
    }
    throw error
  }
  return { ...(data as Omit<Collection, 'card_count'>), card_count: 0 }
}

export async function renameCollection(id: string, name: string) {
  const { error } = await supabase.from('collections').update({ name }).eq('id', id)
  if (error && !isMissingSchema(error)) throw error
}

export async function deleteCollection(id: string) {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error && !isMissingSchema(error)) throw error
}

export async function addCardsToCollection(collectionId: string, cardIds: string[]) {
  if (!cardIds.length) return
  const { error } = await supabase
    .from('collection_cards')
    .upsert(cardIds.map(id => ({ collection_id: collectionId, highlight_id: id })))
  if (error && !isMissingSchema(error)) throw error
}

export async function removeCardFromCollection(collectionId: string, cardId: string) {
  const { error } = await supabase
    .from('collection_cards')
    .delete()
    .eq('collection_id', collectionId)
    .eq('highlight_id', cardId)
  if (error && !isMissingSchema(error)) throw error
}

export async function listCollectionCardIds(collectionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('collection_cards')
    .select('highlight_id')
    .eq('collection_id', collectionId)

  if (error) {
    if (isMissingSchema(error)) return []
    throw error
  }
  return (data as { highlight_id: string }[]).map(r => r.highlight_id)
}

export function filterByIds(cards: Card[], ids: string[]): Card[] {
  const set = new Set(ids)
  return cards.filter(c => set.has(c.id))
}
