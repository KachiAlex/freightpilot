import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('freightpilot_access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refresh = localStorage.getItem('freightpilot_refresh')
      if (refresh) {
        try {
          const { data } = await apiClient.post('/auth/refresh/', { refresh })
          localStorage.setItem('freightpilot_access', data.access)
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('freightpilot_access')
          localStorage.removeItem('freightpilot_refresh')
        }
      }
    }
    return Promise.reject(error)
  },
)
