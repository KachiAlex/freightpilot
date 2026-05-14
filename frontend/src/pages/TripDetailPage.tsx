import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import type { LatLngTuple } from 'leaflet'
import { useRegenerateSchedule, useTrip } from '../hooks'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { TripDetailHeader } from '../components/TripDetailHeader'

export const TripDetailPage = () => {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)
  const regenerateSchedule = useRegenerateSchedule(tripId)

  const handleRegenerate = () => {
    regenerateSchedule.mutate(undefined, {
      onSuccess: () => {
        toast.success('Schedule regenerated with the latest duty clocks')
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'Unable to regenerate schedule'
        toast.error(message)
      },
    })
  }

  if (isLoading || !trip) {
    return <p className="px-4 py-10 text-slate">Loading trip…</p>
  }

  const toLatLngTuple = (lat?: string | null, lng?: string | null): LatLngTuple | null => {
    if (!lat || !lng) {
      return null
    }
    const parsedLat = Number(lat)
    const parsedLng = Number(lng)
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return null
    }
    return [parsedLat, parsedLng]
  }

  const pickupCoords = toLatLngTuple(trip.pickup_latitude, trip.pickup_longitude)
  const dropoffCoords = toLatLngTuple(trip.dropoff_latitude, trip.dropoff_longitude)
  const restStops = (trip.schedule_snapshot?.rest_stops ?? trip.duty_segments.filter((segment) => segment.status === 'off_duty' || segment.status === 'sleeper_berth').map((segment) => ({
    status: segment.status,
    start_time: segment.start_time,
    end_time: segment.end_time,
    remarks: segment.remarks,
  })))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white">
      <TripDetailHeader trip={trip} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Schedule segments</p>
            <button
              className="rounded-2xl border border-white/20 px-4 py-1.5 text-xs font-semibold text-slate hover:border-sky/60 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate/50"
              onClick={handleRegenerate}
              disabled={regenerateSchedule.isPending}
            >
              {regenerateSchedule.isPending ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
          <div className="mt-2 text-xs text-slate">
            Last generated{' '}
            {trip.schedule_snapshot?.generated_at
              ? new Date(trip.schedule_snapshot.generated_at).toLocaleString()
              : 'Not yet generated'}
          </div>
          <div className="mt-4 space-y-3">
            {trip.duty_segments.map((segment) => (
              <div key={segment.id} className="rounded-2xl border border-white/5 bg-black/50 px-4 py-3">
                <p className="text-sm font-semibold text-white">{segment.status.replaceAll('_', ' ')}</p>
                <p className="text-xs text-slate">
                  {new Date(segment.start_time).toLocaleString()} – {new Date(segment.end_time).toLocaleString()}
                </p>
                <p className="text-xs text-slate/80">{segment.remarks}</p>
              </div>
            ))}
          </div>
        </div>
        <MapPlaceholder
          pickup={trip.pickup_location}
          dropoff={trip.dropoff_location}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          distanceMiles={trip.total_distance_miles}
          driveHours={trip.estimated_drive_hours}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Trip metadata</p>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-slate">Driver type</dt>
            <dd className="text-lg font-semibold">{trip.driver_type}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Current status</dt>
            <dd className="text-lg font-semibold">{trip.current_duty_status}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Cycle hours used</dt>
            <dd className="text-lg font-semibold">{trip.current_cycle_hours_used} hrs</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Available drive hours</dt>
            <dd className="text-lg font-semibold">{trip.current_available_drive_hours} hrs</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Planned distance</dt>
            <dd className="text-lg font-semibold">{trip.total_distance_miles ? `${trip.total_distance_miles} mi` : '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Drive time estimate</dt>
            <dd className="text-lg font-semibold">{trip.estimated_drive_hours ? `${trip.estimated_drive_hours} hrs` : '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">ETA</dt>
            <dd className="text-lg font-semibold">{trip.eta ? new Date(trip.eta).toLocaleString() : '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Drive block preference</dt>
            <dd className="text-lg font-semibold">
              {trip.rest_preferences?.drive_block_hours ? `${trip.rest_preferences.drive_block_hours} hrs` : 'Default 4 hrs'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate">Break duration</dt>
            <dd className="text-lg font-semibold">
              {trip.rest_preferences?.break_minutes ? `${trip.rest_preferences.break_minutes} min` : 'Default 30 min'}
            </dd>
          </div>
        </dl>
      </div>

      {restStops.length > 0 && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Planned rest stops</p>
          <div className="mt-4 space-y-3">
            {restStops.map((stop, index) => (
              <div key={`${stop.start_time}-${index}`} className="rounded-2xl border border-white/5 bg-black/50 px-4 py-3 text-sm">
                <p className="font-semibold text-white">Stop {index + 1} · {stop.status.replaceAll('_', ' ')}</p>
                <p className="text-xs text-slate">
                  {new Date(stop.start_time).toLocaleString()} – {new Date(stop.end_time).toLocaleString()}
                </p>
                <p className="text-xs text-slate/80">{stop.remarks || 'Auto-inserted per HOS rule'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
