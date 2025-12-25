/**
 * Auth Store
 * 
 * Pinia store for authentication state
 * Stores UserModel (not raw User interface) and access token
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserModel } from '@/models/user.model'
import { UserRole } from '@/models/user.model'

export const useAuthStore = defineStore('auth', () => {
  // State - In-memory storage (preferred for security)
  const user = ref<UserModel | null>(null)
  const accessToken = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => {
    return user.value !== null && accessToken.value !== null
  })

  /**
   * Get user role (first role or null)
   */
  const role = computed(() => {
    if (!user.value || !user.value.roles || user.value.roles.length === 0) {
      return null
    }
    return user.value.roles[0] as UserRole | string
  })

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => {
    return role.value === UserRole.ADMIN || role.value === 'admin'
  })

  /**
   * Check if user is dealer
   */
  const isDealer = computed(() => {
    return role.value === UserRole.DEALER || role.value === 'dealer'
  })

  /**
   * Check if user is seller
   */
  const isSeller = computed(() => {
    return role.value === UserRole.SELLER || role.value === 'seller'
  })

  // Actions
  const setUser = (userData: UserModel) => {
    user.value = userData
  }

  const setAccessToken = (token: string) => {
    accessToken.value = token
  }

  const setAuth = (userData: UserModel, token: string) => {
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
    role,
    isAdmin,
    isDealer,
    isSeller,
    // Actions
    setUser,
    setAccessToken,
    setAuth,
    logout,
    clearAuth,
  }
})

