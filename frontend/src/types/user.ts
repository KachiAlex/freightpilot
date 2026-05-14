export type UserRole = 'driver' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  cdl_status: string
  home_terminal: string
  carrier_name: string
  phone_number: string
  date_joined: string
  updated_at: string
}
