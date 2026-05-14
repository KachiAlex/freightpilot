import { Outlet } from 'react-router-dom'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-black to-horizon px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl">
        <Outlet />
      </div>
    </div>
  )
}
