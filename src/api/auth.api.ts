/**
 * Auth API Module
 * 
 * Authentication-related API calls
 * Uses new architecture: endpoints, http client, response handler, models
 */

import httpClient from './http'
import { handleSuccess, handleError } from './response'
import { AUTH_ENDPOINTS } from './endpoints'
import { useAuthStore } from '@/stores/auth'
import { normalizeUser } from '@/utils/user'
import { setAccessToken } from '@/utils/token'
import type { UserModel } from '@/models/user.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import axios from 'axios'
import { API_CONFIG } from '@/config/api'
import router from '@/router'

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Register credentials
 */
export interface RegisterCredentials {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  roles?: string[]
}

/**
 * Auth response data
 */
interface AuthResponseData {
  user: any
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Register a new user
 * Returns normalized UserModel
 */
export async function register(credentials: RegisterCredentials): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: AuthResponseData }>(
      AUTH_ENDPOINTS.REGISTER,
      credentials
    )
    
    const data = handleSuccess<AuthResponseData>(response)
    const authStore = useAuthStore()
    
    // Normalize user data
    const user = normalizeUser(data.user)
    
    // Store user and access token
    authStore.setAuth(user, data.access_token)
    
    // Refresh token is automatically stored in HttpOnly cookie by backend
    return user
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Login user
 * Returns normalized UserModel
 */
export async function login(credentials: LoginCredentials): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: AuthResponseData }>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    )
    
    const data = handleSuccess<AuthResponseData>(response)
    const authStore = useAuthStore()
    
    // Normalize user data
    const user = normalizeUser(data.user)
    
    // Store user and access token
    authStore.setAuth(user, data.access_token)
    
    // Refresh token is automatically stored in HttpOnly cookie by backend
    return user
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Refresh access token
 * Uses axios directly to avoid interceptor loop
 */
export async function refreshToken(): Promise<string> {
  try {
    const response = await axios.post<{ data: { access_token: string } }>(
      `${API_CONFIG.baseUrl}${AUTH_ENDPOINTS.REFRESH}`,
      {},
      {
        withCredentials: true,
        baseURL: API_CONFIG.baseUrl,
      }
    )
    
    const data = response.data?.data || response.data
    const accessToken = data?.access_token || (response.data as any)?.access_token
    
    if (!accessToken) {
      throw new Error('No access token in refresh response')
    }
    
    // Update token in store
    setAccessToken(accessToken)
    
    return accessToken
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await httpClient.post(AUTH_ENDPOINTS.LOGOUT, {})
  } catch (error) {
    // Even if logout fails on server, clear local state
    console.error('Logout error:', error)
  } finally {
    const authStore = useAuthStore()
    authStore.logout()
    
    // Redirect to login
    if (router.currentRoute.value.path !== '/auth/login') {
      router.push('/auth/login')
    }
  }
}

/**
 * Get current authenticated user
 * Returns normalized UserModel
 */
export async function getCurrentUser(): Promise<UserModel> {
  try {
    const response = await httpClient.get<{ data: any }>(AUTH_ENDPOINTS.ME)
    const data = handleSuccess<any>(response)
    const authStore = useAuthStore()
    
    // Normalize user data
    const user = normalizeUser(data)
    
    // Update user in store
    authStore.setUser(user)
    
    return user
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Check if user is authenticated
 * Attempts to refresh token if needed
 */
export async function checkAuth(): Promise<boolean> {
  const authStore = useAuthStore()

  // If we have a token but no user data, fetch user data
  if (authStore.accessToken && !authStore.user) {
    try {
      await getCurrentUser()
      return true
    } catch (error) {
      // If fetching user fails, try to refresh token
      try {
        await refreshToken()
        await getCurrentUser()
        return true
      } catch (refreshError) {
        // If refresh also fails, clear auth
        authStore.clearAuth()
        return false
      }
    }
  }

  // If no access token but we might have a refresh token cookie, try to refresh
  if (!authStore.accessToken) {
    try {
      await refreshToken()
      await getCurrentUser()
      return true
    } catch (error) {
      // No valid refresh token or refresh failed
      authStore.clearAuth()
      return false
    }
  }

  return authStore.isAuthenticated
}

/**
 * Forgot password response
 */
export interface ForgotPasswordResponse {
  status: string
  message: string
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await httpClient.post<ForgotPasswordResponse>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      { email }
    )
    return handleSuccess<ForgotPasswordResponse>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Reset password credentials
 */
export interface ResetPasswordCredentials {
  token: string
  email: string
  password: string
  password_confirmation: string
}

/**
 * Reset password response
 */
export interface ResetPasswordResponse {
  status: string
  message: string
}

/**
 * Reset password using token from email
 */
export async function resetPassword(credentials: ResetPasswordCredentials): Promise<ResetPasswordResponse> {
  try {
    const response = await httpClient.post<ResetPasswordResponse>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      credentials
    )
    return handleSuccess<ResetPasswordResponse>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update user profile
 */
export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  address?: string
}

/**
 * Update user profile
 */
export async function updateUser(data: UpdateUserData): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      AUTH_ENDPOINTS.UPDATE_USER,
      data
    )
    const userData = handleSuccess<any>(response)
    const user = normalizeUser(userData)
    const authStore = useAuthStore()
    authStore.setUser(user)
    return user
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Change password
 */
export interface ChangePasswordData {
  current_password: string
  password: string
  password_confirmation: string
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordData): Promise<void> {
  try {
    await httpClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data)
  } catch (error) {
    throw handleError(error)
  }
}

