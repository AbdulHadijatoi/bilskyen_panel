import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    
    // Add access token to Authorization header if available
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const authStore = useAuthStore()

    // If error is 401, clear auth and redirect to login
    if (error.response?.status === 401) {
      authStore.logout()
      if (router.currentRoute.value.path !== '/auth/login') {
        router.push('/auth/login')
      }
      return Promise.reject(error)
    }

    // For other errors, just reject
    return Promise.reject(error)
  }
)

export default apiClient

