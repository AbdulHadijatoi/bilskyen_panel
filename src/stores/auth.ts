import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  roles?: string[]
  permissions?: string[]
  emailVerified?: boolean
  phone?: string
  address?: string
  image?: string
  banned?: boolean
  created_at?: string
}

// Helper to get stored token
function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const useAuthStore = defineStore('auth', () => {
  // State - Restore token from localStorage on initialization
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(getStoredAccessToken())

  // Computed
  const isAuthenticated = computed(() => {
    return user.value !== null && accessToken.value !== null
  })

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setAccessToken = (token: string) => {
    accessToken.value = token
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  const setAuth = (userData: User, token: string) => {
    user.value = userData
    accessToken.value = token
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  }

  return {
    // State
    user,
    accessToken,
    // Computed
    isAuthenticated,
    // Actions
    setUser,
    setAccessToken,
    setAuth,
    logout,
    clearAuth,
  }
})

