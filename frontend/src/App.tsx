import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import './App.css'
import { useAuth } from './context'
import { AuthLayout } from './pages/AuthLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TripDetailPage } from './pages/TripDetailPage'

const metrics = [
  { label: 'Drivers onboarded', value: '2,400+' },
  { label: 'Avg. violations avoided', value: '98%' },
  { label: 'Hours saved weekly', value: '12 hrs' },
]

const highlights = [
  {
    title: 'Compliance-first planner',
    description:
      'Automatically segment every trip into legal drive blocks, breaks, sleeper periods, and 34-hour resets.',
  },
  {
    title: 'HOS telemetry & alerts',
    description:
      'Live dashboards track 11/14 hour clocks, 70/8 cycles, and push instant alerts before violations occur.',
  },
  {
    title: 'ELD-grade log sheets',
    description:
      'Generate DOT-ready daily logs, remarks, and multi-day PDFs in seconds—no manual drawing required.',
  },
]

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tl from-midnight via-horizon/90 to-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-14 md:px-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate/80">Freightpilot</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Plan compliant miles with one intelligent workspace
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate">
              End-to-end trip planning, FMCSA Hours-of-Service automation, and DOT log generation—built for high-performing fleets and solo drivers.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-64">
            <a
              href="/auth/register"
              className="rounded-2xl bg-sky px-6 py-3 text-center text-base font-semibold text-midnight shadow-card transition hover:-translate-y-0.5"
            >
              Launch dashboard
            </a>
            <a
              href="/auth/login"
              className="rounded-2xl border border-white/20 px-6 py-3 text-center text-base font-semibold text-white/80 transition hover:border-sky/80 hover:text-white"
            >
              Sign in
            </a>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-card"
            >
              <p className="text-3xl font-semibold text-white md:text-4xl">{metric.value}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-slate/70">{metric.label}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-card">
          <div className="grid gap-10 p-10 md:grid-cols-[1.05fr,0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate/70">Trip architecture</p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Build legal drive schedules before wheels start rolling
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate">
                Plug in current, pickup, and dropoff coordinates—Freightpilot calculates compliant drive/rest blocks, sleeper berth periods, fuel stops, and on-duty delays with real-time map visualization.
              </p>
              <div className="mt-8 grid gap-4">
                {highlights.map((highlight) => (
                  <div key={highlight.title} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
                    <p className="mt-2 text-sm text-slate">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-sky/30 bg-gradient-to-br from-horizon/60 to-midnight/80 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate/70">Live status</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Driver: Sasha Cole</h3>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3">
                  <span className="text-slate">11-hr drive clock</span>
                  <span className="text-lg font-semibold text-amber">03h 40m remaining</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3">
                  <span className="text-slate">14-hr window</span>
                  <span className="text-lg font-semibold text-amber">05h 10m remaining</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3">
                  <span className="text-slate">70-hr / 8-day cycle</span>
                  <span className="text-lg font-semibold text-sky">21h 15m available</span>
                </div>
              </div>
              <div className="mt-8 rounded-2xl bg-black/50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Next break</p>
                <p className="mt-2 text-lg font-semibold">30 min fuel + rest stop · Amarillo, TX</p>
                <p className="text-sm text-slate">ETA 56 minutes • automatically inserted at 8hr mark</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-sm text-slate/80">
          Freightpilot · FMCSA-compliant trip orchestration · Privacy · Status · Support
        </footer>
      </div>
    </div>
  )
}

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight text-white">Verifying access…</div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/auth',
    element: <AuthLayout />, 
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/trips/:tripId', element: <TripDetailPage /> },
    ],
  },
]

export default LandingPage
