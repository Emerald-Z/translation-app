import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Those passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) { setError(error.message); return }
    // With email confirmation on, there is no session yet.
    if (data.session) navigate('/account?welcome=1')
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout>
        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink">
          We sent a confirmation link to <strong>{email}</strong>. Open it to activate your
          account, then come back and log in.
        </p>
        <Link to="/login" className="btn-primary mt-8 block text-center">Back to login</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-[26px] font-bold leading-tight text-ink">Sign Up</h1>
      <p className="mt-1 text-sm text-ink">Create a new account to get started</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email}
            onChange={e => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} value={password}
            onChange={e => setPassword(e.target.value)} className="field" placeholder="••••••••" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="confirm">Confirm Password</label>
          <input id="confirm" type="password" required minLength={6} value={confirm}
            onChange={e => setConfirm(e.target.value)} className="field" placeholder="••••••••" />
        </div>

        {error && (
          <p className="rounded-xs bg-rose/40 px-3 py-2 text-xs text-[#5C0A0C]">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-3 text-sm text-ink">
        Already have an account? <Link to="/login" className="underline">Log In</Link>
      </p>
    </AuthLayout>
  )
}
