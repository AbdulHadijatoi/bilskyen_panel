/**
 * Permission Utilities
 * 
 * Role and permission helpers that mirror backend permission matrix exactly
 */

import { getUser, getUserRole, isAdmin, isDealer } from './user'
import { UserRole } from '@/models/user.model'

/**
 * Permission resources (matches backend permission matrix)
 */
export type PermissionResource =
  | 'vehicles'
  | 'leads'
  | 'staff'
  | 'profile'
  | 'subscription'
  | 'favorites'
  | 'saved-searches'
  | 'users'
  | 'dealers'
  | 'plans'
  | 'features'
  | 'subscriptions'
  | 'pages'
  | 'analytics'
  | 'audit-logs'

/**
 * Permission actions (matches backend permission matrix)
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'view'
  | 'assign'
  | 'ban'
  | 'unban'
  | 'publish'

/**
 * Check if user has permission for resource and action
 * Mirrors backend permission:resource,action middleware
 */
export function can(resource: PermissionResource, action: PermissionAction): boolean {
  const user = getUser()
  if (!user) {
    return false
  }

  const role = getUserRole()

  // Admin has all permissions
  if (isAdmin()) {
    return true
  }

  // Dealer permissions (matches backend permission matrix)
  if (isDealer()) {
    const dealerPermissions: Record<string, PermissionAction[]> = {
      vehicles: ['create', 'read', 'update', 'delete'],
      leads: ['read', 'update', 'assign'],
      staff: ['read', 'create', 'update', 'delete'],
      profile: ['read', 'update'],
      subscription: ['read'],
      favorites: ['read', 'create', 'delete'],
      'saved-searches': ['read', 'create', 'delete'],
    }

    const allowedActions = dealerPermissions[resource]
    return allowedActions ? allowedActions.includes(action) : false
  }

  // Seller permissions (if any)
  if (role === UserRole.SELLER) {
    // Add seller-specific permissions here if needed
    return false
  }

  return false
}

/**
 * Check if current user is admin
 * Re-exported from user.ts for convenience
 */
export { isAdmin } from './user'

/**
 * Check if current user is dealer
 * Re-exported from user.ts for convenience
 */
export { isDealer } from './user'

