/**
 * Token Utilities
 * 
 * Centralized token management
 * Tokens stored in Pinia store and persisted to localStorage
 */

import { useAuthStore } from '@/stores/auth'

const ACCESS_TOKEN_KEY = 'access_token'

/**
 * Get access token from auth store
 */
export function getAccessToken(): string | null {
  const authStore = useAuthStore()
  return authStore.accessToken
}

/**
 * Set access token in auth store and persist to localStorage
 */
export function setAccessToken(token: string): void {
  const authStore = useAuthStore()
  authStore.setAccessToken(token)
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * Get access token from localStorage
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Clear all tokens from auth store and localStorage
 */
export function clearTokens(): void {
  const authStore = useAuthStore()
  authStore.logout()
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

