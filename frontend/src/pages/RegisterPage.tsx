import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../context'
import type { UserRole } from '../types/user'

const roles: { label: string; value: UserRole; description: string }[] = [
  { label: 'Driver', value: 'driver', description: 'Plan solo and team trips with HOS automation.' },
  { label: 'Admin / Dispatcher', value: 'admin', description: 'Monitor fleets, compliance alerts, and trip health.' },
]

export const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('driver')
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    cdl_status: '',
    home_terminal: '',
    carrier_name: '',
    phone_number: '',
  })

  const mutation = useMutation({
    mutationFn: () => register({ ...form, role }),
    onSuccess: () => navigate('/dashboard'),
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate()
  }

  const updateField = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Freightpilot Access</p>
        <h1 className="mt-3 text-3xl font-semibold">Create your workspace</h1>
        <p className="text-slate">We calibrate permissions automatically based on role.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate">Full name</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
              placeholder="Jordan Diaz"
              value={form.full_name}
              onChange={updateField('full_name')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate">Email</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
              placeholder="driver@carrier.com"
              value={form.email}
              onChange={updateField('email')}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate">Password</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            placeholder="••••••••"
            value={form.password}
            onChange={updateField('password')}
            required
            minLength={8}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {roles.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setRole(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                role === option.value ? 'border-sky bg-sky/20' : 'border-white/15 bg-transparent'
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="text-xs text-slate">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate">CDL status</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
              placeholder="Class A"
              value={form.cdl_status}
              onChange={updateField('cdl_status')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate">Home terminal</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
              placeholder="Dallas, TX"
              value={form.home_terminal}
              onChange={updateField('home_terminal')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate">Carrier</label>
          <input
            type="text"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            placeholder="Lone Star Logistics"
            value={form.carrier_name}
            onChange={updateField('carrier_name')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate">Phone</label>
          <input
            type="tel"
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            placeholder="(555) 123-4567"
            value={form.phone_number}
            onChange={updateField('phone_number')}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.status === 'pending'}
          className="w-full rounded-2xl bg-sky px-4 py-3 font-semibold text-midnight transition hover:bg-sky/90 disabled:opacity-50"
        >
          {mutation.status === 'pending' ? 'Creating account…' : 'Create workspace'}
        </button>
      </form>

      <p className="text-sm text-slate">
        Already onboarded?{' '}
        <Link to="/auth/login" className="text-sky hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
