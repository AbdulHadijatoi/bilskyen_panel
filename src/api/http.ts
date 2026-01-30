/**
 * HTTP Client
 * 
 * Single Axios instance with interceptors
 * Handles token management and error handling
 */

import axios, { type InternalAxiosRequestConfig, type AxiosError, type AxiosInstance } from 'axios'
import { API_CONFIG } from '@/config/api'
import { getAccessToken, clearTokens } from '@/utils/token'
import { handleError } from './response'
import router from '@/router'

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
    // If error is 401, clear auth and redirect to login
    if (error.response?.status === 401) {
      clearTokens()
      if (router.currentRoute.value.path !== '/auth/login') {
        router.push('/auth/login')
      }
      return Promise.reject(error)
    }

    // For other errors, use centralized error handler
    const apiError = handleError(error)
    return Promise.reject(apiError)
  }
)

export default httpClient

