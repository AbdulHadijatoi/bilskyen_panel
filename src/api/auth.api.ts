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
import type { UserModel } from '@/models/user.model'
import type { ApiErrorModel } from '@/models/api-error.model'
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
    
    return user
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
 * Restores token from localStorage if needed and validates it
 */
export async function checkAuth(): Promise<boolean> {
  const authStore = useAuthStore()
  const { getStoredAccessToken, clearTokens } = await import('@/utils/token')

  // If no token in store, try to restore from localStorage
  if (!authStore.accessToken) {
    const storedToken = getStoredAccessToken()
    if (storedToken) {
      authStore.setAccessToken(storedToken)
    } else {
      return false
    }
  }

  // If we have a token but no user data, fetch user data to validate token
  if (authStore.accessToken && !authStore.user) {
    try {
      await getCurrentUser()
      return true
    } catch (error) {
      // If fetching user fails (token invalid/expired), clear auth
      clearTokens()
      return false
    }
  }

  // If we have both token and user, user is authenticated
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
    const response = await httpClient.post<{ data: ForgotPasswordResponse }>(
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
    const response = await httpClient.post<{ data: ResetPasswordResponse }>(
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

