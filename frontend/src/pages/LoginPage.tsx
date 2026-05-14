import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../context'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const mutation = useMutation({
    mutationFn: () => login(form.email, form.password),
    onSuccess: () => navigate('/dashboard'),
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Freightpilot Access</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome back</h1>
        <p className="text-slate">Plan compliant miles with a single command center.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate">Email</label>
          <input
            type="email"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            placeholder="driver@carrier.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Password</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.status === 'pending'}
          className="w-full rounded-2xl bg-sky px-4 py-3 font-semibold text-midnight transition hover:bg-sky/90 disabled:opacity-50"
        >
          {mutation.status === 'pending' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-slate">
        Need access?{' '}
        <Link to="/auth/register" className="text-sky hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
