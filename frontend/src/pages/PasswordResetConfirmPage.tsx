import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { apiClient } from '../lib/api'

interface PasswordResetConfirmPayload {
  uid: string
  token: string
  new_password: string
}

export const PasswordResetConfirmPage = () => {
  const [searchParams] = useSearchParams()
  const initialUid = searchParams.get('uid') ?? ''
  const initialToken = searchParams.get('token') ?? ''

  const [form, setForm] = useState({
    uid: initialUid,
    token: initialToken,
    new_password: '',
    confirm_password: '',
  })
  const [message, setMessage] = useState<string>('')

  const mutation = useMutation({
    mutationFn: async (payload: PasswordResetConfirmPayload) => {
      const { data } = await apiClient.post('/auth/password/reset/confirm/', payload)
      return data
    },
    onSuccess: (data) => {
      setMessage(data.message ?? 'Password updated successfully. You can log in.')
    },
  })

  const passwordsMatch = useMemo(() => form.new_password && form.new_password === form.confirm_password, [form])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    mutation.mutate({
      uid: form.uid,
      token: form.token,
      new_password: form.new_password,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Choose a new password</p>
        <h1 className="mt-3 text-3xl font-semibold">Reset access</h1>
        <p className="text-slate">Paste the secure link parameters you received via email, then set a strong password.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate">UID</label>
          <input
            type="text"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 font-mono text-sm focus:border-sky focus:outline-none"
            value={form.uid}
            onChange={(event) => setForm((prev) => ({ ...prev, uid: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Token</label>
          <input
            type="text"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 font-mono text-sm focus:border-sky focus:outline-none"
            value={form.token}
            onChange={(event) => setForm((prev) => ({ ...prev, token: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">New password</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.new_password}
            onChange={(event) => setForm((prev) => ({ ...prev, new_password: event.target.value }))}
            minLength={8}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Confirm password</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.confirm_password}
            onChange={(event) => setForm((prev) => ({ ...prev, confirm_password: event.target.value }))}
            minLength={8}
            required
          />
          {!passwordsMatch && form.confirm_password && (
            <p className="text-xs text-amber">Passwords must match.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={mutation.status === 'pending' || !passwordsMatch}
          className="w-full rounded-2xl bg-sky px-4 py-3 font-semibold text-midnight transition hover:bg-sky/90 disabled:opacity-50"
        >
          {mutation.status === 'pending' ? 'Updating…' : 'Update password'}
        </button>
      </form>

      {message && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate">{message}</p>}

      <p className="text-sm text-slate">
        <Link to="/auth/login" className="text-sky hover:underline">
          Return to login
        </Link>
      </p>
    </div>
  )
}
