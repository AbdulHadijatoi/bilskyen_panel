/**
 * User Utilities
 * 
 * Centralized user extraction and normalization
 * Always use mapped UserModel, never raw API responses
 */

import { useAuthStore } from '@/stores/auth'
import type { UserModel } from '@/models/user.model'
import { mapUserFromApi } from '@/models/user.model'
import { UserRole } from '@/models/user.model'

/**
 * Get current user from auth store
 * Returns UserModel (normalized) or null
 */
export function getUser(): UserModel | null {
  const authStore = useAuthStore()
  return authStore.user
}

/**
 * Get user role from current user
 * Returns first role or null
 */
export function getUserRole(): UserRole | string | null {
  const user = getUser()
  if (!user || !user.roles || user.roles.length === 0) {
    return null
  }
  return user.roles[0] as UserRole
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const role = getUserRole()
  return role === UserRole.ADMIN || role === 'admin'
}

/**
 * Check if current user is dealer
 */
export function isDealer(): boolean {
  const role = getUserRole()
  return role === UserRole.DEALER || role === 'dealer'
}

/**
 * Check if current user is seller
 */
export function isSeller(): boolean {
  const role = getUserRole()
  return role === UserRole.SELLER || role === 'seller'
}

/**
 * Normalize user data from API response
 * Converts snake_case to camelCase and returns UserModel
 */
export function normalizeUser(apiUser: any): UserModel {
  return mapUserFromApi(apiUser)
}

