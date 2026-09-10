import { supabase, isMissingSchema, type Profile } from './supabase'

const LOCAL_KEY = 'lingomous.profile'

function localProfile(): Partial<Profile> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveLocal(patch: Partial<Profile>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...localProfile(), ...patch }))
  } catch {
    /* private browsing — the server copy is still the source of truth */
  }
}

/**
 * Reads the signed-in user's profile. Falls back to a locally cached copy (and
 * then to the email handle) when the profiles table has not been created yet.
 */
export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const fallback: Profile = {
    id: user.id,
    username: localProfile().username ?? user.email?.split('@')[0] ?? 'reader',
    primary_language: localProfile().primary_language ?? 'en',
    avatar_path: localProfile().avatar_path ?? null,
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    if (isMissingSchema(error)) return fallback
    throw error
  }
  if (!data) return fallback

  const row = data as Profile
  return {
    id: row.id,
    username: row.username || fallback.username,
    primary_language: row.primary_language || fallback.primary_language,
    avatar_path: row.avatar_path ?? null,
  }
}

/** True when the profile row already exists — used to decide on the setup step. */
export async function hasProfile(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return isMissingSchema(error) ? Boolean(localProfile().username) : false
  return Boolean(data)
}

export async function saveProfile(patch: {
  username: string
  primary_language: string
  avatar_path?: string | null
}): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  saveLocal(patch)

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...patch })
    .select()
    .single()

  if (error) {
    if (isMissingSchema(error)) return { id: user.id, ...patch } as Profile
    throw error
  }
  return data as Profile
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const path = `avatars/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '')}`
  const { error } = await supabase.storage.from('covers').upload(path, file)
  if (error) return null
  return path
}

export function avatarUrl(path?: string | null): string | null {
  if (!path) return null
  return supabase.storage.from('covers').getPublicUrl(path).data.publicUrl
}
