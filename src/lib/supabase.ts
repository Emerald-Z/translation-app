import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export type ReadingMode = 'highlight' | 'side-by-side' | 'translated'

export interface Book {
  id: string
  filename: string
  storage_path: string
  language: string
  total_pages: number | null
  last_page: number
  created_at: string
  /* Added by migration 0001. Optional so the app still runs without it. */
  title?: string | null
  author?: string | null
  translation_language?: string | null
  reading_mode?: ReadingMode | null
  favorite?: boolean | null
  cover_path?: string | null
  last_opened_at?: string | null
}

export interface Profile {
  id: string
  username: string
  primary_language: string
  avatar_path?: string | null
}

/**
 * True when Postgres rejected the statement because a column or relation from
 * migration 0001 is missing. Callers use this to fall back to the old schema
 * instead of surfacing an error the user cannot act on.
 */
export function isMissingSchema(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code
  const message = (error as { message?: string } | null)?.message ?? ''
  return (
    code === '42703' || // undefined_column
    code === '42P01' || // undefined_table
    code === 'PGRST204' || // PostgREST: column not found in schema cache
    /column .* does not exist|relation .* does not exist|could not find/i.test(message)
  )
}
