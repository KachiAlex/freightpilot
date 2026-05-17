import { useState } from 'react'

import { useAuth } from '../context'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { TripList } from '../components/TripList'
import { TripPlannerForm } from '../components/TripPlannerForm'
import { VehicleList } from '../components/VehicleList'
import { VehicleForm } from '../components/VehicleForm'

export const DashboardPage = () => {
  const { user, logout } = useAuth()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleRefresh, setVehicleRefresh] = useState(0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate/70">Live status</p>
          <h1 className="mt-3 text-4xl font-semibold">Welcome, {user?.full_name}</h1>
          <p className="text-slate">Role: {user?.role === 'admin' ? 'Dispatcher / Admin' : 'Driver'}</p>
        </div>
        <button className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Trip planner</p>
            <h2 className="text-2xl font-semibold">Plan a compliant trip</h2>
          </div>
          <TripPlannerForm onPreviewChange={({ pickup, dropoff }) => {
            setPickup(pickup)
            setDropoff(dropoff)
          }} />
        </div>
        <MapPlaceholder pickup={pickup} dropoff={dropoff} />
      </div>

      <div className="mt-10">
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Latest trips</p>
        <h2 className="text-2xl font-semibold">Auto-generated schedules</h2>
        <div className="mt-4">
          <TripList />
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Vehicle management</p>
            <h2 className="text-2xl font-semibold">Your vehicles</h2>
          </div>
          <button
            onClick={() => setShowVehicleForm(!showVehicleForm)}
            className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate hover:border-sky/60 hover:text-white"
          >
            {showVehicleForm ? 'Cancel' : 'Add Vehicle'}
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {showVehicleForm && (
            <VehicleForm
              onSuccess={() => {
                setShowVehicleForm(false)
                setVehicleRefresh((prev) => prev + 1)
              }}
            />
          )}
          <VehicleList key={vehicleRefresh} />
        </div>
      </div>
    </div>
  )
}
