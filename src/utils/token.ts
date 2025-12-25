/**
 * Token Utilities
 * 
 * Centralized token management - tokens stored in Pinia store only
 * No localStorage access for security
 */

import { useAuthStore } from '@/stores/auth'

/**
 * Get access token from auth store
 */
export function getAccessToken(): string | null {
  const authStore = useAuthStore()
  return authStore.accessToken
}

/**
 * Set access token in auth store
 */
export function setAccessToken(token: string): void {
  const authStore = useAuthStore()
  authStore.setAccessToken(token)
}

/**
 * Clear all tokens from auth store
 */
export function clearTokens(): void {
  const authStore = useAuthStore()
  authStore.logout()
}

