/**
 * HTTP Client
 * 
 * Single Axios instance with interceptors
 * Handles token management and error handling
 */

import axios, { type InternalAxiosRequestConfig, type AxiosError, type AxiosInstance } from 'axios'
import { API_CONFIG } from '@/config/api'
import { getRequestLocale } from '@/utils/defaultLocale'
import { getAccessToken, clearTokens } from '@/utils/token'
import { handleError } from './response'
import router from '@/router'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Create axios instance
 */
const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  withCredentials: true,
  headers: {
    'Content-Type': API_CONFIG.contentType,
    'Accept': API_CONFIG.accept,
  },
})

/**
 * Request interceptor - Add access token to requests
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from store (via utils/token.ts)
    const token = getAccessToken()
    
    // Add access token to Authorization header if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.headers) {
      config.headers['Accept-Language'] = getRequestLocale()
    }
    
    // If sending FormData, remove Content-Type header to let browser set it
    // with the correct multipart/form-data boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url || '')
    const isStopImpersonation = requestUrl.includes('/stop-impersonation')
    const isPanelRefresh = requestUrl.includes('/panel-refresh')

    if (status === 401) {
      const authStore = useAuthStore()

      // Never refresh via the admin cookie while impersonating — that would
      // silently restore the admin identity. Restore the stashed admin session instead.
      if (authStore.isImpersonating && !isStopImpersonation && !isPanelRefresh) {
        const snap = authStore.impersonation
        authStore.clearImpersonation()
        if (snap?.adminToken && snap.adminUser) {
          authStore.setAuth(snap.adminUser, snap.adminToken, snap.adminFeatures || {})
          if (router.currentRoute.value.name !== 'admin.dealers') {
            router.push({ name: 'admin.dealers' })
          }
        } else {
          clearTokens()
          if (router.currentRoute.value.path !== '/auth/login') {
            router.push('/auth/login')
          }
        }
        return Promise.reject(error)
      }

      if (!isStopImpersonation) {
        clearTokens()
        if (router.currentRoute.value.path !== '/auth/login') {
          router.push('/auth/login')
        }
      }
      return Promise.reject(error)
    }

    // For other errors, use centralized error handler
    const apiError = handleError(error)
    return Promise.reject(apiError)
  }
)

export default httpClient

