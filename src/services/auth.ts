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

export interface RefreshResponse {
  status: string
  data: {
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
    const response = await apiClient.post<RegisterResponse>('/auth/register', credentials)
    const authStore = useAuthStore()

    if (response.data.status === 'success' && response.data.data) {
      // Store user and access token in memory
      authStore.setAuth(response.data.data.user, response.data.data.access_token)
      
      // Refresh token is automatically stored in HttpOnly cookie by backend
      return response.data
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
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    const authStore = useAuthStore()

    if (response.data.status === 'success' && response.data.data) {
      // Store user and access token in memory
      authStore.setAuth(response.data.data.user, response.data.data.access_token)
      
      // Refresh token is automatically stored in HttpOnly cookie by backend
      return response.data
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
 * Refresh access token using refresh token (stored in HttpOnly cookie)
 * Uses axios directly to avoid interceptor issues when no access token exists
 */
export async function refreshToken(): Promise<RefreshResponse> {
  try {
    // Use axios directly (not apiClient) to avoid interceptor issues
    // when there's no access token (e.g., on page refresh)
    const response = await axios.post<RefreshResponse>(
      `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
      {},
      {
        withCredentials: true, // Send refresh token cookie
        baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      }
    )
    
    if (response.data.status === 'success' && response.data.data) {
      const authStore = useAuthStore()
      authStore.setAccessToken(response.data.data.access_token)
      return response.data
    }

    throw new Error('Invalid response format')
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      status: 'error',
      message: error.message || 'Token refresh failed',
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
    const response = await apiClient.get<MeResponse>('/auth/me')
    const authStore = useAuthStore()

    if (response.data.status === 'success' && response.data.data) {
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
 * On page refresh, attempts to refresh token if no access token exists
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
      // Attempt to refresh token using refresh token cookie
      await refreshToken()
      // After successful refresh, get user data
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

