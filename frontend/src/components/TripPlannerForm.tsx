import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useCreateTrip } from '../hooks'
import type { RestPreferences, TripFormPayload } from '../types/trip'
import { buildRestPreview, defaultRestPreferences, formatPreviewSegment } from '../lib/schedulePreview'

const localDateInputValue = (date = new Date()) => date.toISOString().slice(0, 16)

const defaultForm: TripFormPayload = {
  vehicle_id: null,
  current_location: '',
  pickup_location: '',
  dropoff_location: '',
  start_time: localDateInputValue(),
  driver_type: 'solo',
  current_cycle_hours_used: 0,
  current_available_drive_hours: 11,
  current_available_duty_hours: 14,
  current_duty_status: 'off_duty',
  notes: '',
}

interface TripPlannerFormProps {
  onPreviewChange?: (data: { pickup: string; dropoff: string }) => void
}

export const TripPlannerForm = ({ onPreviewChange }: TripPlannerFormProps) => {
  const [form, setForm] = useState(defaultForm)
  const [restPreferences, setRestPreferences] = useState<RestPreferences>({ ...defaultRestPreferences })
  const mutation = useCreateTrip()

  useEffect(() => {
    onPreviewChange?.({ pickup: form.pickup_location, dropoff: form.dropoff_location })
  }, [form.pickup_location, form.dropoff_location, onPreviewChange])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({ ...form, rest_preferences: restPreferences }, {
      onSuccess: () => {
        setForm({ ...defaultForm, start_time: localDateInputValue() })
        setRestPreferences({ ...defaultRestPreferences })
        toast.success('Trip scheduled and HOS segments generated')
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'Unable to create trip right now'
        toast.error(message)
      },
    })
  }

  const updateField = (field: keyof TripFormPayload) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateRestPreference = (field: keyof RestPreferences) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setRestPreferences((prev) => ({ ...prev, [field]: value }))
  }

  const previewSegments = useMemo(() => {
    const start = new Date(form.start_time)
    if (Number.isNaN(start.getTime())) {
      return []
    }
    return buildRestPreview(start, restPreferences).map(formatPreviewSegment)
  }, [form.start_time, restPreferences])

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate">Current location</label>
          <input
            type="text"
            required
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.current_location}
            onChange={updateField('current_location')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Pickup location</label>
          <input
            type="text"
            required
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.pickup_location}
            onChange={updateField('pickup_location')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate">Dropoff location</label>
        <input
          type="text"
          required
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
          value={form.dropoff_location}
          onChange={updateField('dropoff_location')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate">Start time</label>
          <input
            type="datetime-local"
            required
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.start_time}
            onChange={updateField('start_time')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Driver type</label>
          <select
            className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 focus:border-sky focus:outline-none"
            value={form.driver_type}
            onChange={updateField('driver_type')}
          >
            <option value="solo">Solo</option>
            <option value="team">Team</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-slate">Cycle hours used (70/8)</label>
          <input
            type="number"
            min={0}
            max={70}
            step={0.25}
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.current_cycle_hours_used}
            onChange={updateField('current_cycle_hours_used')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Available drive hours (11)</label>
          <input
            type="number"
            min={0}
            max={11}
            step={0.25}
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.current_available_drive_hours}
            onChange={updateField('current_available_drive_hours')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate">Available duty hours (14)</label>
          <input
            type="number"
            min={0}
            max={14}
            step={0.25}
            className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
            value={form.current_available_duty_hours}
            onChange={updateField('current_available_duty_hours')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate">Current duty status</label>
        <input
          type="text"
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
          value={form.current_duty_status}
          onChange={updateField('current_duty_status')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate">Notes</label>
        <input
          type="text"
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
          value={form.notes}
          onChange={updateField('notes')}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Rest cadence</p>
            <p className="text-lg font-semibold">Plan required breaks</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate">
            Drive block (hrs)
            <input
              type="number"
              step={0.5}
              min={1}
              max={6}
              className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-sky focus:outline-none"
              value={restPreferences.drive_block_hours}
              onChange={updateRestPreference('drive_block_hours')}
            />
          </label>
          <label className="text-sm text-slate">
            Break duration (min)
            <input
              type="number"
              step={5}
              min={15}
              max={120}
              className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-sky focus:outline-none"
              value={restPreferences.break_minutes}
              onChange={updateRestPreference('break_minutes')}
            />
          </label>
          <label className="text-sm text-slate">
            Second drive block (hrs)
            <input
              type="number"
              step={0.5}
              min={1}
              max={6}
              className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-sky focus:outline-none"
              value={restPreferences.second_drive_hours}
              onChange={updateRestPreference('second_drive_hours')}
            />
          </label>
          <label className="text-sm text-slate">
            Sleeper reset (hrs)
            <input
              type="number"
              step={0.5}
              min={8}
              max={14}
              className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-sky focus:outline-none"
              value={restPreferences.sleeper_hours}
              onChange={updateRestPreference('sleeper_hours')}
            />
          </label>
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Rest stop preview</p>
          <div className="mt-3 space-y-3">
            {previewSegments.map((segment) => (
              <div key={`${segment.label}-${segment.start.toISOString()}`} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                <p className="font-semibold text-white">{segment.label}</p>
                <p className="text-slate text-xs">
                  {segment.startLabel} – {segment.endLabel}
                </p>
              </div>
            ))}
            {!previewSegments.length && <p className="text-xs text-slate">Set a valid start time to preview rest cadence.</p>}
          </div>
        </div>
      </div>

      <button
        className="w-full rounded-2xl bg-sky px-4 py-3 font-semibold text-midnight transition hover:bg-sky/90 disabled:opacity-50"
        disabled={mutation.status === 'pending'}
        type="submit"
      >
        {mutation.status === 'pending' ? 'Generating schedule…' : 'Create trip'}
      </button>
    </form>
  )
}
