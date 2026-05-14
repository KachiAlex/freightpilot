import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { apiClient } from '../lib/api'

type PasswordResetResponse = {
  message: string
  debug?: {
    uid: string
    token: string
    reset_url: string
  }
}

export const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState('')
  const [serverMessage, setServerMessage] = useState<string>('')
  const [debugPayload, setDebugPayload] = useState<PasswordResetResponse['debug']>()

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<PasswordResetResponse>('/auth/password/reset/', { email })
      return data
    },
    onSuccess: (data) => {
      setServerMessage(data.message)
      setDebugPayload(data.debug)
    },
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerMessage('')
    setDebugPayload(undefined)
    mutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Reset credentials</p>
        <h1 className="mt-3 text-3xl font-semibold">Forgot password</h1>
        <p className="text-slate">
          Enter the email tied to your Freightpilot account. We&apos;ll send a secure reset link and surface it in the server log for
          local testing.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate">Email</label>
          <input
            type="email"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            placeholder="driver@carrier.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={mutation.status === 'pending'}
          className="w-full rounded-2xl bg-sky px-4 py-3 font-semibold text-midnight transition hover:bg-sky/90 disabled:opacity-50"
        >
          {mutation.status === 'pending' ? 'Sending link…' : 'Send reset link'}
        </button>
      </form>

      {serverMessage && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate">{serverMessage}</p>}

      {debugPayload && (
        <div className="space-y-2 rounded-2xl border border-amber/30 bg-amber/5 p-4 text-xs text-amber">
          <p className="font-semibold uppercase tracking-[0.35em] text-amber/70">Development shortcut</p>
          <p>You&apos;re running in DEBUG mode, so the reset link is available instantly:</p>
          <p className="break-all font-mono">{debugPayload.reset_url}</p>
        </div>
      )}

      <p className="text-sm text-slate">
        Remembered your password?{' '}
        <Link to="/auth/login" className="text-sky hover:underline">
          Go back to login
        </Link>
      </p>
    </div>
  )
}
