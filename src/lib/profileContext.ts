import { createContext, useContext } from 'react'
import type { Profile } from './supabase'

export interface ProfileState {
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
}

export const ProfileContext = createContext<ProfileState>({
  profile: null,
  loading: true,
  refresh: async () => {},
})

/** The signed-in user's profile, loaded once by ProfileProvider. */
export const useProfile = () => useContext(ProfileContext)
