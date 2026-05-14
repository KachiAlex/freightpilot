import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import type { Trip, TripFormPayload } from '../types/trip'
import { tripKeys } from './useTrip'

export const useTrips = () => {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get<Trip[]>('/trips/')
      return data
    },
  })
}

export const useCreateTrip = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TripFormPayload) => {
      const { data } = await apiClient.post<Trip>('/trips/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

export const useRegenerateSchedule = (tripId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!tripId) {
        throw new Error('tripId is required')
      }
      const { data } = await apiClient.post<Trip>(`/trips/${tripId}/regenerate_schedule/`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
      if (tripId) {
        queryClient.setQueryData(tripKeys.detail(tripId), data)
      }
    },
  })
}
