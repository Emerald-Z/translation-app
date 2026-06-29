import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export interface Book {
  id: string
  filename: string
  storage_path: string
  language: string
  total_pages: number | null
  last_page: number
  created_at: string
}
