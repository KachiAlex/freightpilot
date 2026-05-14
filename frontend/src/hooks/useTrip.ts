import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import type { Trip } from '../types/trip'

export const tripKeys = {
  all: ['trips'] as const,
  detail: (id: string | number) => ['trip', id] as const,
}

export const useTrip = (tripId: string | undefined) => {
  return useQuery({
    queryKey: tripKeys.detail(tripId ?? 'new'),
    queryFn: async () => {
      if (!tripId) {
        throw new Error('tripId required')
      }
      const { data } = await apiClient.get<Trip>(`/trips/${tripId}/`)
      return data
    },
    enabled: Boolean(tripId),
  })
}
