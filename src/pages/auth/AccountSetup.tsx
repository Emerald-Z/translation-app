import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import Dropdown from '../../components/Dropdown'
import { LANGUAGES } from '../../lib/languages'
import { avatarUrl, saveProfile, uploadAvatar } from '../../lib/profile'
import { useProfile } from '../../lib/profileContext'
import fallbackAvatar from '../../assets/art/avatar.png'

/** Account customization — shown right after sign-up and from the profile menu. */
export default function AccountSetup() {
  const { profile, refresh } = useProfile()
  const [params] = useSearchParams()
  const isWelcome = params.get('welcome') === '1'

  const [username, setUsername] = useState('')
  const [language, setLanguage] = useState('en')
  const [avatarPath, setAvatarPath] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username)
    setLanguage(profile.primary_language)
    setAvatarPath(profile.avatar_path ?? null)
  }, [profile])

  async function handleAvatar(file: File | undefined) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    const path = await uploadAvatar(file)
    if (path) setAvatarPath(path)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await saveProfile({
        username: username.trim() || 'reader',
        primary_language: language,
        avatar_path: avatarPath,
      })
      await refresh()
      navigate('/')
    } catch {
      setError('Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const src = preview ?? avatarUrl(avatarPath) ?? fallbackAvatar

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-[102px] w-[102px] overflow-hidden rounded-full ring-1 ring-white/70 transition hover:opacity-90"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleAvatar(e.target.files?.[0])}
          />
          <p className="mt-2 text-sm text-ink">Profile Photo</p>
        </div>

        <div className="mt-7 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink" htmlFor="username">Username</label>
            <input
              id="username" value={username} onChange={e => setUsername(e.target.value)}
              className="field" placeholder="bunnybookster123" required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink" htmlFor="lang">Primary Language</label>
            <Dropdown
              size="md"
              className="w-full"
              value={language}
              onChange={setLanguage}
              options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xs bg-rose/40 px-3 py-2 text-xs text-[#5C0A0C]">{error}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary mt-8 w-full">
          {saving ? 'Saving…' : 'Done'}
        </button>

        {!isWelcome && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-3 w-full text-sm text-ink underline"
          >
            Cancel
          </button>
        )}
      </form>
    </AuthLayout>
  )
}
