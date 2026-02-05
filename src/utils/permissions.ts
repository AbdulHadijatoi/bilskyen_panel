/**
 * Permission Utilities
 * 
 * Role and permission helpers that check actual permissions from user object
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
  | 'manage'
  | 'status'
  | 'media'
  | 'messages'

/**
 * Check if user has a specific permission string
 * @param permission Permission string (e.g., 'dealer.vehicles.view', 'admin.users.create')
 * @returns boolean
 */
export function hasPermission(permission: string): boolean {
  const user = getUser()
  if (!user) {
    return false
  }

  // Admin has all permissions
  if (isAdmin()) {
    return true
  }

  // Check if user has the permission in their permissions array
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission)
  }

  return false
}

/**
 * Check if user has permission for resource and action
 * Maps resource and action to permission string format: {role}.{resource}.{action}
 * 
 * @param resource Permission resource (e.g., 'vehicles', 'leads')
 * @param action Permission action (e.g., 'view', 'create', 'update')
 * @returns boolean
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

  // Build permission string based on role and resource/action
  let permission: string

  if (isDealer()) {
    // Dealer permissions follow pattern: dealer.{resource}.{action}
    // Map some actions to specific permission names
    const actionMap: Record<string, string> = {
      'read': 'view',
      'list': 'view',
      'manage': 'manage',
    }
    
    const mappedAction = actionMap[action] || action
    permission = `dealer.${resource}.${mappedAction}`
  } else if (role === UserRole.SELLER) {
    // Seller permissions (if any)
    return false
  } else {
    // Unknown role
    return false
  }

  return hasPermission(permission)
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
