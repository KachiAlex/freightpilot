import type { User, UserRole } from './user'

export type DriverType = 'solo' | 'team'

export type DutyStatusCode = 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty'

export interface DutySegment {
  id: number
  status: DutyStatusCode
  start_time: string
  end_time: string
  remarks: string
}

export interface ScheduleSnapshotSegment {
  status: DutyStatusCode
  start_time: string
  end_time: string
  remarks: string
}

export interface RestStopSnapshot {
  status: DutyStatusCode
  start_time: string
  end_time: string
  remarks: string
}

export interface ScheduleSnapshot {
  generated_at: string
  segments: ScheduleSnapshotSegment[]
  rest_stops?: RestStopSnapshot[]
}

export interface RestPreferences {
  drive_block_hours: number
  break_minutes: number
  second_drive_hours: number
  sleeper_hours: number
}

export interface Trip {
  id: number
  driver: number | User
  vehicle: {
    id: number
    truck_number: string
    trailer_number: string
    fuel_efficiency_mpg: string
  } | null
  current_location: string
  pickup_location: string
  dropoff_location: string
  pickup_latitude: string | null
  pickup_longitude: string | null
  dropoff_latitude: string | null
  dropoff_longitude: string | null
  start_time: string
  driver_type: DriverType
  current_cycle_hours_used: string
  current_available_drive_hours: string
  current_available_duty_hours: string
  current_duty_status: string
  total_distance_miles: string | null
  estimated_drive_hours: string | null
  eta: string | null
  status: 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  schedule_snapshot: ScheduleSnapshot | null
  rest_preferences?: RestPreferences | null
  notes: string
  created_at: string
  updated_at: string
  duty_segments: DutySegment[]
  log_sheets: unknown[]
}

export interface TripFormPayload {
  vehicle_id?: number | null
  current_location: string
  pickup_location: string
  dropoff_location: string
  pickup_latitude?: number | null
  pickup_longitude?: number | null
  dropoff_latitude?: number | null
  dropoff_longitude?: number | null
  start_time: string
  driver_type: DriverType
  current_cycle_hours_used: number
  current_available_drive_hours: number
  current_available_duty_hours: number
  current_duty_status: string
  notes?: string
  rest_preferences?: RestPreferences
}
