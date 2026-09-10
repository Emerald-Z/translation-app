import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { avatarUrl } from '../lib/profile'
import { useProfile } from '../lib/profileContext'
import fallbackAvatar from '../assets/art/avatar.png'

export default function ProfileMenu() {
  const { profile } = useProfile()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const src = avatarUrl(profile?.avatar_path) ?? fallbackAvatar

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-sand/60"
      >
        <img src={src} alt="" className="h-8 w-8 rounded-full object-cover" />
        <span className="text-sm text-ink">{profile?.username ?? '…'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-[220px] rounded-xs bg-white p-2 shadow-panel">
          <button
            onClick={() => { setOpen(false); navigate('/account') }}
            className="w-full rounded-xs px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
          >
            Edit profile
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/cards') }}
            className="w-full rounded-xs px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
          >
            My cards
          </button>
          <div className="my-1 h-px bg-line" />
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full rounded-xs px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
