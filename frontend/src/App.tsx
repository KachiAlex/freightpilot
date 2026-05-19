import React, { Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import './App.css'
import { useAuth } from './context'
import { AuthLayout } from './pages/AuthLayout'

// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const PasswordResetConfirmPage = React.lazy(() => import('./pages/PasswordResetConfirmPage').then(m => ({ default: m.PasswordResetConfirmPage })))
const PasswordResetRequestPage = React.lazy(() => import('./pages/PasswordResetRequestPage').then(m => ({ default: m.PasswordResetRequestPage })))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const TripDetailPage = React.lazy(() => import('./pages/TripDetailPage').then(m => ({ default: m.TripDetailPage })))

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-neutral-white text-neutral-dark">
    <div className="animate-pulse-custom text-lg">Loading…</div>
  </div>
)

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-white text-neutral-dark">Verifying access…</div>
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
    element: (
      <Suspense fallback={<PageLoader />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
      { path: 'register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
      { path: 'password-reset', element: <Suspense fallback={<PageLoader />}><PasswordResetRequestPage /></Suspense> },
      { path: 'password-reset/confirm', element: <Suspense fallback={<PageLoader />}><PasswordResetConfirmPage /></Suspense> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
      { path: '/trips/:tripId', element: <Suspense fallback={<PageLoader />}><TripDetailPage /></Suspense> },
    ],
  },
]

export default HomePage
