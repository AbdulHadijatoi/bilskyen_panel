/**
 * Token Utilities
 *
 * Access tokens live in Pinia memory and sessionStorage (not localStorage)
 * to reduce XSS persistence across browser sessions.
 */

import { useAuthStore } from '@/stores/auth.store'

const ACCESS_TOKEN_KEY = 'access_token'

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

/**
 * Get access token from auth store
 */
export function getAccessToken(): string | null {
  const authStore = useAuthStore()
  return authStore.accessToken
}

/**
 * Set access token in auth store and persist to sessionStorage
 */
export function setAccessToken(token: string): void {
  const authStore = useAuthStore()
  authStore.setAccessToken(token)
  storage()?.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * Get access token from sessionStorage (migrates legacy localStorage once)
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  const fromSession = sessionStorage.getItem(ACCESS_TOKEN_KEY)
  if (fromSession) return fromSession

  // One-time migration away from localStorage
  const legacy = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (legacy) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, legacy)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    return legacy
  }
  return null
}

/**
 * Clear all tokens from auth store and session/local storage
 */
export function clearTokens(): void {
  const authStore = useAuthStore()
  authStore.logout()
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
