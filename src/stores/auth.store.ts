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
import { getStoredAccessToken } from '@/utils/token'

export interface ImpersonationSnapshot {
  dealerId: number
  dealerName: string
  adminUser: UserModel
  adminToken: string
  adminFeatures: Record<string, string>
}

const IMPERSONATION_KEY = 'impersonation'
const ACCESS_TOKEN_KEY = 'access_token'

function loadImpersonation(): ImpersonationSnapshot | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(IMPERSONATION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ImpersonationSnapshot
    if (!parsed?.adminToken || !parsed?.adminUser || !parsed?.dealerId) return null
    return parsed
  } catch {
    sessionStorage.removeItem(IMPERSONATION_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State - Restore token from localStorage on initialization
  const user = ref<UserModel | null>(null)
  const accessToken = ref<string | null>(getStoredAccessToken())
  const subscriptionFeatures = ref<Record<string, string>>({})
  const impersonation = ref<ImpersonationSnapshot | null>(loadImpersonation())

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

  const isImpersonating = computed(() => impersonation.value !== null)

  // Actions
  const setUser = (userData: UserModel) => {
    user.value = userData
  }

  const setAccessToken = (token: string) => {
    accessToken.value = token
    // Persist to sessionStorage (not localStorage) to limit XSS blast radius
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  }

  const setAuth = (userData: UserModel, token: string, features?: Record<string, string>) => {
    user.value = userData
    accessToken.value = token
    subscriptionFeatures.value = features || {}
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  }

  const setSubscriptionFeatures = (features: Record<string, string>) => {
    subscriptionFeatures.value = features
  }

  const startImpersonation = (snapshot: ImpersonationSnapshot) => {
    impersonation.value = snapshot
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(snapshot))
    }
  }

  const clearImpersonation = () => {
    impersonation.value = null
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(IMPERSONATION_KEY)
    }
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    subscriptionFeatures.value = {}
    impersonation.value = null
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      sessionStorage.removeItem(IMPERSONATION_KEY)
    }
  }

  const clearAuth = () => {
    logout()
  }

  return {
    // State
    user,
    accessToken,
    subscriptionFeatures,
    impersonation,
    // Computed
    isAuthenticated,
    role,
    isAdmin,
    isDealer,
    isSeller,
    isImpersonating,
    // Actions
    setUser,
    setAccessToken,
    setAuth,
    setSubscriptionFeatures,
    startImpersonation,
    clearImpersonation,
    logout,
    clearAuth,
  }
})
