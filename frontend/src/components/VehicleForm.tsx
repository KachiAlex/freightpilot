import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { apiClient } from '../lib/api'
import type { Vehicle } from './VehicleList'

interface VehicleFormProps {
  vehicle?: Vehicle
  onSuccess?: () => void
}

export const VehicleForm = ({ vehicle, onSuccess }: VehicleFormProps) => {
  const [form, setForm] = useState({
    truck_number: vehicle?.truck_number ?? '',
    trailer_number: vehicle?.trailer_number ?? '',
    fuel_efficiency_mpg: vehicle?.fuel_efficiency_mpg ?? '',
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: result } = await apiClient.post('/vehicles/', data)
      return result
    },
    onSuccess: () => {
      toast.success('Vehicle created successfully')
      setForm({ truck_number: '', trailer_number: '', fuel_efficiency_mpg: '' })
      onSuccess?.()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create vehicle'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!vehicle) throw new Error('No vehicle to update')
      const { data: result } = await apiClient.patch(`/vehicles/${vehicle.id}/`, data)
      return result
    },
    onSuccess: () => {
      toast.success('Vehicle updated successfully')
      onSuccess?.()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update vehicle'
      toast.error(message)
    },
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.truck_number.trim()) {
      toast.error('Truck number is required')
      return
    }
    if (vehicle) {
      updateMutation.mutate(form)
    } else {
      createMutation.mutate(form)
    }
  }

  const updateField = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-slate">Truck number *</label>
        <input
          type="text"
          required
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
          placeholder="T-12345"
          value={form.truck_number}
          onChange={updateField('truck_number')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate">Trailer number</label>
        <input
          type="text"
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
          placeholder="TR-67890"
          value={form.trailer_number}
          onChange={updateField('trailer_number')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate">Fuel efficiency (MPG)</label>
        <input
          type="number"
          step={0.1}
          min={0}
          className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 focus:border-sky focus:outline-none"
          placeholder="6.5"
          value={form.fuel_efficiency_mpg}
          onChange={updateField('fuel_efficiency_mpg')}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-sky px-4 py-3 font-semibold text-midnight transition hover:bg-sky/90 disabled:opacity-50"
      >
        {isLoading ? (vehicle ? 'Updating…' : 'Creating…') : vehicle ? 'Update vehicle' : 'Add vehicle'}
      </button>
    </form>
  )
}
