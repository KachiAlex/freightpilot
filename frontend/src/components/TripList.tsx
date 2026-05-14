import { Link } from 'react-router-dom'
import { useTrips } from '../hooks'
import type { Trip } from '../types/trip'

const statusColor: Record<Trip['status'], string> = {
  draft: 'bg-gray-500',
  planned: 'bg-sky',
  in_progress: 'bg-amber-400',
  completed: 'bg-green-400',
  cancelled: 'bg-red-500',
}

export const TripList = () => {
  const { data, isLoading } = useTrips()

  if (isLoading) {
    return <p className="text-slate">Loading trips…</p>
  }

  if (!data?.length) {
    return <p className="text-slate">No trips yet. Submit the planner to generate one.</p>
  }

  return (
    <div className="space-y-4">
      {data.map((trip) => (
        <article key={trip.id} className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate/70">Trip #{trip.id}</p>
              <h3 className="text-2xl font-semibold text-white">
                {trip.pickup_location} → {trip.dropoff_location}
              </h3>
              <p className="text-sm text-slate">Start {new Date(trip.start_time).toLocaleString()}</p>
            </div>
            <span className={`rounded-full px-4 py-1 text-sm font-semibold ${statusColor[trip.status]}`}>
              {trip.status.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-2">
            <Link to={`/trips/${trip.id}`} className="text-sm text-sky hover:underline">
              View detail →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-slate/70">
            {trip.total_distance_miles && <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] normal-case tracking-[0.2em]">{trip.total_distance_miles} mi</span>}
            {trip.estimated_drive_hours && <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] normal-case tracking-[0.2em]">{trip.estimated_drive_hours} hrs drive</span>}
            {trip.eta && <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] normal-case tracking-[0.2em]">ETA {new Date(trip.eta).toLocaleTimeString()}</span>}
          </div>
          {trip.schedule_snapshot?.segments && (
            <div className="mt-4 grid gap-2">
              {trip.schedule_snapshot.segments.map((segment, index) => (
                <div key={index} className="rounded-2xl border border-white/5 bg-black/40 px-4 py-3 text-sm text-slate">
                  <p className="font-semibold text-white">{segment.status.replace('_', ' ')}</p>
                  <p>
                    {new Date(segment.start_time).toLocaleTimeString()} – {new Date(segment.end_time).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-slate/80">{segment.remarks}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
