import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  roles?: string[]
  emailVerified?: boolean
  phone?: string
  address?: string
  image?: string
  banned?: boolean
  created_at?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State - In-memory storage (preferred for security)
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  // Flag to prevent refresh token loop - set to true when refresh fails
  const refreshTokenFailed = ref<boolean>(false)

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
  }

  const setAuth = (userData: User, token: string) => {
    user.value = userData
    accessToken.value = token
    // Reset refresh token failure flag on successful auth
    refreshTokenFailed.value = false
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    // Reset refresh token failure flag on logout
    refreshTokenFailed.value = false
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    // Don't reset flag on clearAuth - keep it to prevent loops
  }

  /**
   * Mark refresh token as failed - prevents further refresh attempts
   */
  const markRefreshTokenFailed = () => {
    refreshTokenFailed.value = true
  }

  /**
   * Reset refresh token failure flag - called on successful login/register
   */
  const resetRefreshTokenFailed = () => {
    refreshTokenFailed.value = false
  }

  return {
    // State
    user,
    accessToken,
    refreshTokenFailed,
    // Computed
    isAuthenticated,
    // Actions
    setUser,
    setAccessToken,
    setAuth,
    logout,
    clearAuth,
    markRefreshTokenFailed,
    resetRefreshTokenFailed,
  }
})

