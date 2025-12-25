/**
 * Dealer Model
 * 
 * Maps backend dealer response to TypeScript interface
 */

/**
 * Subscription status (matches backend SubscriptionStatus constants)
 */
export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  SCHEDULED = 'scheduled',
}

/**
 * Dealer model interface
 */
export interface DealerModel {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  website?: string
  logo?: string
  description?: string
  subscriptionId?: number
  subscriptionStatus?: SubscriptionStatus
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  
  // Relations (if included in response)
  subscription?: SubscriptionModel
  staff?: DealerStaffModel[]
}

/**
 * Subscription model
 */
export interface SubscriptionModel {
  id: number
  dealerId: number
  planId: number
  status: SubscriptionStatus
  startDate?: string
  endDate?: string
  trialEndsAt?: string
  canceledAt?: string
  createdAt?: string
  updatedAt?: string
  
  plan?: PlanModel
}

/**
 * Plan model
 */
export interface PlanModel {
  id: number
  name: string
  description?: string
  price: number
  interval?: string
  features?: FeatureModel[]
  createdAt?: string
  updatedAt?: string
}

/**
 * Feature model
 */
export interface FeatureModel {
  id: number
  name: string
  description?: string
  key: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Dealer staff model
 */
export interface DealerStaffModel {
  id: number
  dealerId: number
  userId: number
  roleId?: number
  role?: string
  createdAt?: string
  updatedAt?: string
  
  user?: any
}

/**
 * Map API response (snake_case) to DealerModel (camelCase)
 */
export function mapDealerFromApi(data: any): DealerModel {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    website: data.website,
    logo: data.logo,
    description: data.description,
    subscriptionId: data.subscription_id,
    subscriptionStatus: data.subscription_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
    subscription: data.subscription ? mapSubscriptionFromApi(data.subscription) : undefined,
    staff: data.staff?.map(mapDealerStaffFromApi),
  }
}

/**
 * Map subscription from API
 */
export function mapSubscriptionFromApi(data: any): SubscriptionModel {
  return {
    id: data.id,
    dealerId: data.dealer_id,
    planId: data.plan_id,
    status: data.status,
    startDate: data.start_date,
    endDate: data.end_date,
    trialEndsAt: data.trial_ends_at,
    canceledAt: data.canceled_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    plan: data.plan ? mapPlanFromApi(data.plan) : undefined,
  }
}

/**
 * Map plan from API
 */
export function mapPlanFromApi(data: any): PlanModel {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    interval: data.interval,
    features: data.features?.map(mapFeatureFromApi),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Map feature from API
 */
export function mapFeatureFromApi(data: any): FeatureModel {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    key: data.key,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Map dealer staff from API
 */
export function mapDealerStaffFromApi(data: any): DealerStaffModel {
  return {
    id: data.id,
    dealerId: data.dealer_id,
    userId: data.user_id,
    roleId: data.role_id,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    user: data.user,
  }
}

