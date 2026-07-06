/**
 * Subscription Features Utility
 *
 * Helper functions to check subscription features for dealers
 */

import { useAuthStore } from '@/stores/auth.store'

/**
 * Subscription features type
 * Key-value pairs where key is feature name and value is string (will be converted as needed)
 */
export type SubscriptionFeatures = Record<string, string>

/**
 * Get subscription features from auth store
 * Reads .value so that limits are reactive and computed() tracks the store.
 */
export function getSubscriptionFeatures(): SubscriptionFeatures {
  const authStore = useAuthStore()
  const ref = authStore.subscriptionFeatures
  const value: Record<string, string> | undefined =
    ref && typeof ref === 'object' && 'value' in ref
      ? (ref as unknown as { value: Record<string, string> }).value
      : (ref as Record<string, string> | undefined)
  return value ?? {}
}

/**
 * Check if a boolean feature is enabled
 */
export function hasFeature(featureKey: string): boolean {
  const features = getSubscriptionFeatures()
  const value = features[featureKey]

  if (value === undefined || value === null) {
    return false
  }

  if (typeof value === 'boolean') {
    return value
  }

  const strValue = String(value).toLowerCase()
  return strValue === 'true' || strValue === '1'
}

/**
 * Get a number feature limit
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
 */
export function checkFeatureLimit(featureKey: string, currentCount: number): boolean {
  const limit = getFeatureLimit(featureKey, 0)

  if (limit === 0) {
    return false
  }

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
  MAX_STAFF_USERS = 'max_staff_users',
  PRIORITY_SUPPORT = 'priority_support',
  ANALYTICS = 'analytics',
  MAX_VEHICLE_IMAGES = 'max_vehicle_images',
  MAX_EQUIPMENT_PER_VEHICLE = 'max_equipment_per_vehicle',
  UPLOAD_3D_VIEW = 'upload_3d_view',
  AUDIT_LOGS = 'audit_logs',
  AI_ASSISTANT = 'ai_assistant',
  AI_MONTHLY_REQUESTS = 'ai_monthly_requests',
  LISTING_HEALTH_INBOX = 'listing_health_inbox',
  LISTING_HEALTH_ACTIONS = 'listing_health_actions',
  LISTING_HEALTH_AI_FIXES = 'listing_health_ai_fixes',
  LISTING_HEALTH_AI_BRIEFING = 'listing_health_ai_briefing',
  LISTING_HEALTH_EQUIPMENT_GAP = 'listing_health_equipment_gap',
  LISTING_HEALTH_PRICE_APPLY = 'listing_health_price_apply',
  LISTING_HEALTH_BEFORE_AFTER = 'listing_health_before_after',
  MARKET_PULSE = 'market_pulse',
  PRICING_INTELLIGENCE = 'pricing_intelligence',
  PRICE_CHANGE_ALERTS = 'price_change_alerts',
  AUTO_FEATURE_LISTINGS = 'auto_feature_listings',
  LISTING_BOOST = 'listing_boost',
  PREMIUM_DEALER_BADGE = 'premium_dealer_badge',
  ENQUIRY_AI_REPLIES = 'enquiry_ai_replies',
  LEAD_AI_SUMMARY = 'lead_ai_summary',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  ANALYTICS_PDF_EXPORT = 'analytics_pdf_export',
  ANALYTICS_LISTING_FUNNEL = 'analytics_listing_funnel',
  ANALYTICS_DEALER_BENCHMARK = 'analytics_dealer_benchmark',
  LEAD_AUTO_ASSIGN = 'lead_auto_assign',
  LEAD_SLA_ALERTS = 'lead_sla_alerts',
  LEAD_TASK_BOARD = 'lead_task_board',
  INVENTORY_FEEDS = 'inventory_feeds',
  SYNDICATION = 'syndication',
  SYNDICATION_CHANNELS = 'syndication_channels',
  DMS_SYNC = 'dms_sync',
  BULK_PRICE_UPDATE = 'bulk_price_update',
  API_ACCESS = 'api_access',
  MARKETING_CAMPAIGNS = 'marketing_campaigns',
  RETARGETING = 'retargeting',
  FINANCE_CALCULATOR_DEALER = 'finance_calculator_dealer',
  DEAL_BUILDER = 'deal_builder',
  REVIEW_MANAGEMENT = 'review_management',
  DEALER_TRUST_BADGE = 'dealer_trust_badge',
  BRANDED_INVENTORY_AUDIT = 'branded_inventory_audit',
}

const PLAN_FEATURE_ERROR_PATTERN =
  /subscription plan does not include|abonnement inkluderer ikke/i

/** True when the API rejected the call because the dealer plan lacks a feature. */
export function isPlanFeatureError(error: unknown): boolean {
  const message = (error as { message?: string })?.message ?? ''
  return PLAN_FEATURE_ERROR_PATTERN.test(message)
}

/** Human-readable plan tier order for subscription page sorting */
export const PLAN_SORT_ORDER: Record<string, number> = {
  basic: 1,
  professional: 2,
  premium: 3,
  'basic-payg': 4,
  'professional-payg': 5,
  'premium-payg': 6,
}
