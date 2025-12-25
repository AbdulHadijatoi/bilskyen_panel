/**
 * HTTP Client
 * 
 * Single Axios instance with interceptors
 * Handles token management, refresh, and error handling
 */

import axios, { type InternalAxiosRequestConfig, type AxiosError, type AxiosInstance } from 'axios'
import { API_CONFIG } from '@/config/api'
import { getAccessToken, setAccessToken, clearTokens } from '@/utils/token'
import { handleError } from './response'
import router from '@/router'

/**
 * Create axios instance
 */
const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  withCredentials: true, // Important for HttpOnly cookies (refresh token)
  headers: {
    'Content-Type': API_CONFIG.contentType,
    'Accept': API_CONFIG.accept,
  },
})

/**
 * Token refresh state
 */
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

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
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle token refresh and errors
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return httpClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        // Use axios directly (not httpClient) to avoid interceptor loop
        const response = await axios.post(
          `${API_CONFIG.baseUrl}/auth/refresh`,
          {},
          {
            withCredentials: true, // Send refresh token cookie
            baseURL: API_CONFIG.baseUrl,
          }
        )

        const responseData = response.data
        const accessToken = responseData?.data?.access_token || responseData?.access_token
        
        if (accessToken) {
          // Update access token in store
          setAccessToken(accessToken)
          
          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          
          // Process queued requests
          processQueue(null, accessToken)
          
          // Retry the original request
          return httpClient(originalRequest)
        } else {
          throw new Error('No access token in refresh response')
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        processQueue(refreshError as AxiosError, null)
        clearTokens()
        
        // Redirect to login page
        if (router.currentRoute.value.path !== '/auth/login') {
          router.push('/auth/login')
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // For other errors, use centralized error handler
    const apiError = handleError(error)
    return Promise.reject(apiError)
  }
)

export default httpClient

