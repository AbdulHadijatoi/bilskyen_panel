/**
 * User Model
 * 
 * Maps backend user response to TypeScript interface
 * Converts snake_case to camelCase
 */

/**
 * User status enum (matches backend UserStatus constants)
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * User roles (matches backend role names)
 */
export enum UserRole {
  ADMIN = 'admin',
  DEALER = 'dealer',
  SELLER = 'seller',
}

/**
 * User model interface
 */
export interface UserModel {
  id: number
  name: string
  email: string
  phone?: string
  emailVerified: boolean
  emailVerifiedAt?: string
  image?: string
  banned: boolean
  statusId?: number
  status?: UserStatus
  roles?: string[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

/**
 * Map API response (snake_case) to UserModel (camelCase)
 */
export function mapUserFromApi(data: any): UserModel {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    emailVerified: !!data.email_verified_at,
    emailVerifiedAt: data.email_verified_at,
    image: data.image,
    banned: data.banned ?? false,
    statusId: data.status_id,
    status: data.status,
    roles: data.roles || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
  }
}

