import { Link } from 'react-router-dom'
import type { Trip } from '../types/trip'

export const TripDetailHeader = ({ trip }: { trip: Trip }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Trip #{trip.id}</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {trip.pickup_location} → {trip.dropoff_location}
        </h1>
        <p className="text-sm text-slate">ETA {trip.eta ? new Date(trip.eta).toLocaleString() : 'TBD'}</p>
      </div>
      <Link to="/dashboard" className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate">
        Back to dashboard
      </Link>
    </div>
  )
}
