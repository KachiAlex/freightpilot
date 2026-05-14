import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { apiClient } from '../lib/api'
import type { User, UserRole } from '../types/user'

type RegisterPayload = {
  email: string
  full_name: string
  password: string
  role: UserRole
  cdl_status?: string
  home_terminal?: string
  carrier_name?: string
  phone_number?: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  confirmPasswordReset: (uid: string, token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ACCESS_KEY = 'freightpilot_access'
const REFRESH_KEY = 'freightpilot_refresh'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const persistTokens = (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  }

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  const refreshProfile = async () => {
    try {
      const { data } = await apiClient.get<User>('/auth/profile/')
      setUser(data)
    } catch (error) {
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const hasToken = !!localStorage.getItem(ACCESS_KEY)
    if (hasToken) {
      refreshProfile()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login/', { email, password })
    persistTokens(data.access, data.refresh)
    setUser(data.user)
  }

  const register = async (payload: RegisterPayload) => {
    await apiClient.post('/auth/register/', payload)
    await login(payload.email, payload.password)
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.assign('/auth/login')
    }
  }

  const requestPasswordReset = async (email: string) => {
    await apiClient.post('/auth/password/reset/', { email })
  }

  const confirmPasswordReset = async (uid: string, token: string, newPassword: string) => {
    await apiClient.post('/auth/password/reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
    })
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      requestPasswordReset,
      confirmPasswordReset,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
