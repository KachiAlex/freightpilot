import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import './App.css'
import heroMock from './assets/hero.png'
import { useAuth } from './context'
import { AuthLayout } from './pages/AuthLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { PasswordResetConfirmPage } from './pages/PasswordResetConfirmPage'
import { PasswordResetRequestPage } from './pages/PasswordResetRequestPage'
import { RegisterPage } from './pages/RegisterPage'
import { TripDetailPage } from './pages/TripDetailPage'

const metrics = [
  { label: 'Drivers orchestrated', value: '2,400+', detail: 'across regional & OTR fleets' },
  { label: 'Violations prevented', value: '98%', detail: '11-/14-hour alerts triggered' },
  { label: 'Hours saved weekly', value: '12 hrs', detail: 'per dispatcher on average' },
]

const productHighlights = [
  {
    title: 'Compliance-first planner',
    description:
      'Model FMCSA rules before keys turn—drive blocks, breaks, sleeper resets, and 34-hour restarts map automatically.',
  },
  {
    title: 'Live HOS telemetry',
    description:
      'Monitor 11/14/70-hour clocks in real time with proactive notifications for every driver and dispatcher.',
  },
  {
    title: 'ELD-grade documentation',
    description:
      'Generate DOT-ready log sheets, remarks, and PDFs moments after a trip is scheduled.',
  },
]

const workflowSteps = [
  {
    label: '1 · Capture intent',
    detail: 'Drop pickup + dropoff, current location, and rest preferences into a single form.',
  },
  {
    label: '2 · Validate legality',
    detail: 'Planner simulates mileage, ETA, and HOS impact before dispatch approves.',
  },
  {
    label: '3 · Execute & adapt',
    detail: 'Live dashboard surfaces remaining clocks, break timers, and violation risks.',
  },
]

const marqueeLogos = ['Pilot Freight', 'Cascadia Dispatch', 'Velocity Haulage', 'Northwind Logistics']

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02040d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-[-10%] h-96 w-96 rounded-full bg-sky/30 blur-[140px]" />
        <div className="absolute left-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-horizon/20 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-10 md:px-8">
        <nav className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5/80 px-6 py-5 backdrop-blur-lg md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky to-horizon text-lg font-semibold text-midnight">
              FP
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.5em] text-white/60">Freightpilot</p>
              <p className="text-lg font-semibold">Plan miles with certainty</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <a className="rounded-full border border-white/10 px-4 py-1.5 transition hover:border-white/40 hover:text-white" href="#product">
              Product
            </a>
            <a className="rounded-full border border-white/10 px-4 py-1.5 transition hover:border-white/40 hover:text-white" href="#workflow">
              Workflow
            </a>
            <a className="rounded-full border border-white/10 px-4 py-1.5 transition hover:border-white/40 hover:text-white" href="#compliance">
              Compliance
            </a>
            <a className="rounded-full border border-white/20 px-5 py-1.5 font-semibold text-white transition hover:border-sky/60" href="/auth/login">
              Sign in
            </a>
            <a className="rounded-full bg-gradient-to-r from-sky to-horizon px-6 py-1.5 font-semibold text-midnight shadow-card transition hover:-translate-y-0.5" href="/auth/register">
              Launch app
            </a>
          </div>
        </nav>

        <section className="grid gap-12 rounded-[36px] border border-white/10 bg-white/[0.03] p-8 text-white md:grid-cols-[1.05fr,0.95fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate/60">HOS copilot</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
              Plan compliant miles with one intelligent workspace.
            </h1>
            <p className="mt-5 text-base text-slate/80">
              End-to-end trip planning, FMCSA Hours-of-Service automation, and DOT log generation—built for high-performing fleets and solo drivers.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky to-horizon px-7 py-3 text-base font-semibold text-midnight shadow-card transition hover:shadow-[0_12px_50px_rgba(14,165,233,0.35)]" href="/auth/register">
                Schedule a trip
                <span aria-hidden="true">↗</span>
              </a>
              <a className="flex items-center justify-center rounded-2xl border border-white/20 px-7 py-3 text-base font-semibold text-white/80 transition hover:border-white/60 hover:text-white" href="/auth/login">
                Explore dashboard
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-4">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.5em] text-white/50">{metric.label}</p>
                  <p className="mt-1 text-xs text-white/70">{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[42px] bg-gradient-to-tr from-sky/30 via-white/10 to-transparent blur-3xl" />
            <div className="relative rounded-[38px] border border-white/10 bg-[#050913]/70 p-6 shadow-2xl">
              <img src={heroMock} alt="Freightpilot interface mock" className="h-auto w-full rounded-3xl border border-white/10 object-cover" />
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-white/70">11-hour drive clock</span>
                  <span className="text-lg font-semibold text-amber">03h 40m</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-white/70">14-hour duty window</span>
                  <span className="text-lg font-semibold text-amber">05h 10m</span>
                </div>
                <div className="rounded-2xl border border-sky/40 bg-sky/10 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.6em] text-white/60">Auto-inserted rest</p>
                  <p className="text-base font-semibold">30 min fuel + break · Amarillo, TX</p>
                  <p className="text-xs text-white/70">ETA 56 minutes · triggered at 8-hour mark</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-black/40 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-slate/60">Trusted by modern fleets</p>
              <p className="text-sm text-slate/70">Powering carriers from 15 to 1,500 trucks</p>
            </div>
            <div className="text-xs text-slate/60">SOC 2 Type II · GDPR ready</div>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate/70 md:grid-cols-4">
            {marqueeLogos.map((logo) => (
              <div key={logo} className="rounded-2xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent px-4 py-3 text-center font-semibold tracking-wide">
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section id="product" className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] p-8 md:grid-cols-[0.95fr,1.05fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-slate/70">Product signal</p>
            <h2 className="mt-4 text-3xl font-semibold">Trip architecture that starts with legality, not guesswork.</h2>
            <p className="mt-3 text-base text-slate">
              Route estimation, HOS validation, dispatch collaboration, and driver documentation harmonized in a single stack.
            </p>
            <div className="mt-6 grid gap-4">
              {productHighlights.map((highlight) => (
                <article key={highlight.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-sky">{highlight.title.slice(0, 1)}</span>
                    <h3 className="text-lg font-semibold">{highlight.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate">{highlight.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-horizon/35 via-midnight/40 to-midnight/80 p-6">
            <p className="text-xs uppercase tracking-[0.45em] text-slate/70">Live insights</p>
            <div className="mt-4 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs text-slate">Trip · Phoenix → Charlotte</p>
                <p className="text-2xl font-semibold text-white">1,981 mi · ETA 36h</p>
                <p className="text-sm text-slate">Three scheduled rest stops • last recalculated 8 mins ago</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-slate">Watchlist</p>
                <ul className="mt-3 space-y-2 text-sm text-slate/90">
                  <li>• Ronan Blake · 11-hour drive clock hits zero in 52 min</li>
                  <li>• Team 46A · 34-hour reset auto-scheduled in Boise</li>
                  <li>• Dispatcher alert · Late fuel stop at mile 728</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-sky/40 bg-sky/15 p-5">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Compliance pulse</p>
                <p className="text-base text-white">7 active alerts · 3 rest violations prevented today</p>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="rounded-3xl border border-white/10 bg-black/15 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-slate/70">Workflow</p>
              <h2 className="mt-2 text-3xl font-semibold">Operational clarity from planning to proof.</h2>
            </div>
            <a className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-sky/70 hover:text-white" href="/auth/register">
              See it live ↗
            </a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <article key={step.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.45em] text-slate/60">{step.label}</p>
                <p className="mt-2 text-base text-white">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="compliance" className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-tr from-black/25 via-black/10 to-white/5 p-8 md:grid-cols-[1.05fr,0.95fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-slate/70">Compliance proof</p>
            <h2 className="mt-3 text-3xl font-semibold">HOS automation that stands up to roadside inspections.</h2>
            <p className="mt-3 text-base text-slate">
              Every trip snapshot stores generated segments, rest stops, timestamps, and remarks. Export a PDF log sheet or share via secure link when auditors ask.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate">
              <li>• Automated 11/14/70-hour monitoring</li>
              <li>• Instant PDF log exports for DOT officers</li>
              <li>• Dispatcher alerts for impending breaches</li>
              <li>• Mapbox-powered route overlays for context</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/45 p-6">
            <p className="text-xs uppercase tracking-[0.45em] text-slate/70">What fleets say</p>
            <div className="mt-4 space-y-4 text-base text-slate">
              <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm italic text-slate/90">
                “We trimmed dispatch prep time in half and haven’t had a single 14-hour violation in four months. Freightpilot is the only tab we keep open.”
              </p>
              <p className="text-sm text-slate/70">— Camille Torres, Director of Ops, Northwind Logistics</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-sky/40 bg-gradient-to-r from-sky/40 via-horizon/20 to-horizon/10 p-8 text-midnight">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-midnight/70">Ready in hours</p>
              <h2 className="mt-2 text-3xl font-semibold">Sync your fleet, invite dispatch, and ship compliant miles today.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="rounded-full bg-midnight px-6 py-3 text-base font-semibold text-sky transition hover:bg-black" href="/auth/register">
                Create account
              </a>
              <a className="rounded-full border border-midnight px-6 py-3 text-base font-semibold text-midnight transition hover:border-black hover:text-black" href="/auth/login">
                Log in
              </a>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-black/35 px-6 py-5 text-xs text-slate/70">
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
      { path: 'password-reset', element: <PasswordResetRequestPage /> },
      { path: 'password-reset/confirm', element: <PasswordResetConfirmPage /> },
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
