/**
 * Subscription Features Utility
 * 
 * Helper functions to check subscription features for dealers
 */

import { useAuthStore } from '@/stores/auth'

/**
 * Subscription features type
 * Key-value pairs where key is feature name and value is string (will be converted as needed)
 */
export type SubscriptionFeatures = Record<string, string>

/**
 * Get subscription features from auth store
 */
export function getSubscriptionFeatures(): SubscriptionFeatures {
  const authStore = useAuthStore()
  return authStore.subscriptionFeatures || {}
}

/**
 * Check if a boolean feature is enabled
 * @param featureKey Feature key (e.g., 'audit_logs', 'enquiry_management')
 * @returns true if feature exists and is enabled
 */
export function hasFeature(featureKey: string): boolean {
  const features = getSubscriptionFeatures()
  const value = features[featureKey]
  
  if (value === undefined || value === null) {
    return false
  }
  
  // Handle string 'true'/'false' or actual boolean
  if (typeof value === 'boolean') {
    return value
  }
  
  const strValue = String(value).toLowerCase()
  return strValue === 'true' || strValue === '1'
}

/**
 * Get a number feature limit
 * @param featureKey Feature key (e.g., 'max_listings', 'max_vehicle_images')
 * @param defaultLimit Default limit if feature not found
 * @returns Feature limit as integer
 */
export function getFeatureLimit(featureKey: string, defaultLimit: number = 0): number {
  const features = getSubscriptionFeatures()
  const value = features[featureKey]
  
  if (value === undefined || value === null) {
    return defaultLimit
  }
  
  return parseInt(String(value), 10) || defaultLimit
}

/**
 * Check if a feature limit allows an action
 * @param featureKey Feature key
 * @param currentCount Current count (e.g., number of published vehicles)
 * @returns true if limit allows action (currentCount < limit)
 */
export function checkFeatureLimit(featureKey: string, currentCount: number): boolean {
  const limit = getFeatureLimit(featureKey, 0)
  
  // If limit is 0, feature is disabled
  if (limit === 0) {
    return false
  }
  
  // Check if current count is less than limit
  return currentCount < limit
}

/**
 * Feature keys enum for type safety
 */
export enum FeatureKey {
  MAX_LISTINGS = 'max_listings',
  ENQUIRY_MANAGEMENT = 'enquiry_management',
  LEAD_MANAGEMENT = 'lead_management',
  STAFF_MANAGEMENT = 'staff_management',
  MAX_FEATURE_LISTINGS = 'max_feature_listings',
  PRIORITY_SUPPORT = 'priority_support',
  ANALYTICS = 'analytics',
  MAX_VEHICLE_IMAGES = 'max_vehicle_images',
  UPLOAD_3D_VIEW = 'upload_3d_view',
  AUDIT_LOGS = 'audit_logs',
}
