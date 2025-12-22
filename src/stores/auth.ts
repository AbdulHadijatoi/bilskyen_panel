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
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
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

