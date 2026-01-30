import apiClient from '@/utils/axios'
import axios from 'axios'
import { useAuthStore, type User } from '@/stores/auth'
import router from '@/router'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  roles?: string[]
}

export interface RegisterResponse {
  status: string
  message: string
  data: {
    user: User
    access_token: string
    token_type: string
    expires_in: number
  }
}

export interface LoginResponse {
  status: string
  message: string
  data: {
    user: User
    access_token: string
    token_type: string
    expires_in: number
  }
}

export interface MeResponse {
  status: string
  data: User
}

export interface ApiError {
  status: string
  message: string
  errors?: Record<string, string[]>
  error_code?: string
}

/**
 * Register a new user with email and password
 */
export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<{ data: RegisterResponse['data'] }>('/auth/register', credentials)
    const authStore = useAuthStore()

    // Backend returns { data: { user, access_token, ... } } for success
    if (response.data?.data?.user && response.data?.data?.access_token) {
      // Store user and access token in memory
      authStore.setAuth(response.data.data.user, response.data.data.access_token)
      
      return {
        status: 'success',
        message: 'Registration successful',
        data: response.data.data,
      }
    }

    throw new Error('Invalid response format')
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      status: 'error',
      message: error.message || 'Registration failed',
    } as ApiError
  }
}

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<{ data: LoginResponse['data'] }>('/auth/login', credentials)
    const authStore = useAuthStore()

    // Backend returns { data: { user, access_token, ... } } for success
    if (response.data?.data?.user && response.data?.data?.access_token) {
      // Store user and access token in memory
      authStore.setAuth(response.data.data.user, response.data.data.access_token)
      
      return {
        status: 'success',
        message: 'Login successful',
        data: response.data.data,
      }
    }

    throw new Error('Invalid response format')
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      status: 'error',
      message: error.message || 'Login failed',
    } as ApiError
  }
}

/**
 * Logout user and invalidate tokens
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {})
  } catch (error: any) {
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
 * Get current authenticated user information
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<{ data: MeResponse['data'] }>('/auth/me')
    const authStore = useAuthStore()

    // Backend returns { data: { id, name, email, ... } } for success
    if (response.data?.data) {
      authStore.setUser(response.data.data)
      return response.data.data
    }

    throw new Error('Invalid response format')
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      status: 'error',
      message: error.message || 'Failed to get user information',
    } as ApiError
  }
}

/**
 * Check if user is authenticated and fetch user data if needed
 * Restores token from localStorage if needed
 */
export async function checkAuth(): Promise<boolean> {
  const authStore = useAuthStore()

  // If no token in store, try to restore from localStorage
  if (!authStore.accessToken) {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access_token')
      if (storedToken) {
        authStore.setAccessToken(storedToken)
      } else {
        return false
      }
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
      authStore.clearAuth()
      return false
    }
  }

  // If we have both token and user, user is authenticated
  return authStore.isAuthenticated
}

export interface ForgotPasswordResponse {
  status: string
  message: string
}

export interface ResetPasswordCredentials {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface ResetPasswordResponse {
  status: string
  message: string
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forget-password', {
      email,
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      status: 'error',
      message: error.message || 'Failed to send password reset email',
    } as ApiError
  }
}

/**
 * Reset password using token from email
 */
export async function resetPassword(credentials: ResetPasswordCredentials): Promise<ResetPasswordResponse> {
  try {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', credentials)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      status: 'error',
      message: error.message || 'Failed to reset password',
    } as ApiError
  }
}

