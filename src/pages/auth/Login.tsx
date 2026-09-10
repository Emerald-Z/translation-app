import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-[26px] font-bold leading-tight text-ink">Welcome Back</h1>
      <p className="mt-1 text-sm text-ink">Log in to continue</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="email">Email</label>
          <input
            id="email" type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            className="field" placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink" htmlFor="password">Password</label>
          <input
            id="password" type="password" required minLength={6} value={password}
            onChange={e => setPassword(e.target.value)}
            className="field" placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-xs bg-rose/40 px-3 py-2 text-xs text-[#5C0A0C]">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <p className="mt-3 text-sm text-ink">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="underline">Sign Up</Link>
      </p>
    </AuthLayout>
  )
}
