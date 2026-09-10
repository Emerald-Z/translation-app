import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProfile } from '../lib/profile'
import { ProfileContext } from '../lib/profileContext'
import type { Profile } from '../lib/supabase'

export default function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setProfile(await getProfile())
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const value = useMemo(() => ({ profile, loading, refresh }), [profile, loading, refresh])
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
