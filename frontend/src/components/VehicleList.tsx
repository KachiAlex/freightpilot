import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api'

export type Vehicle = {
  id: number
  truck_number: string
  trailer_number?: string
  fuel_efficiency_mpg?: number
}

interface VehicleListProps {
  onSelectVehicle?: (vehicle: Vehicle) => void
  onEdit?: (vehicle: Vehicle) => void
}

export const VehicleList = ({ onSelectVehicle, onEdit }: VehicleListProps) => {
  const { data: vehicles, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await apiClient.get<Vehicle[]>('/vehicles/')
      return data
    },
  })

  if (isLoading) {
    return <p className="text-slate">Loading vehicles…</p>
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-500">Failed to load vehicles</p>
        <button
          onClick={() => refetch()}
          className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate hover:text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!vehicles?.length) {
    return <p className="text-slate">No vehicles yet. Add one to get started.</p>
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{vehicle.truck_number}</p>
              {vehicle.trailer_number && <p className="text-sm text-slate">Trailer: {vehicle.trailer_number}</p>}
              {vehicle.fuel_efficiency_mpg && <p className="text-sm text-slate">{vehicle.fuel_efficiency_mpg} MPG</p>}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(vehicle)}
                  className="rounded-2xl border border-white/20 px-3 py-1 text-sm text-slate hover:text-white"
                >
                  Edit
                </button>
              )}
              {onSelectVehicle && (
                <button
                  onClick={() => onSelectVehicle(vehicle)}
                  className="rounded-2xl bg-sky px-3 py-1 text-sm font-semibold text-midnight hover:bg-sky/90"
                >
                  Select
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
