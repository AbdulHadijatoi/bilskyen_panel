/**
 * Display helpers for dealer analytics (API placeholders, plans, subscription status).
 */

import i18n from '@/plugins/i18n'
import { featureDisplayName, type FeatureLike } from '@/utils/featureDisplay'

function t(key: string): string {
  const result = i18n.global.t(key)
  return typeof result === 'string' ? result : key
}

const API_PLACEHOLDER_MAP: Record<string, string> = {
  Unknown: 'common.unknown',
  'N/A': 'common.notSet',
  'No Plan': 'dealer.views.analytics.noPlan',
  None: 'dealer.views.analytics.statusNone',
}

/**
 * Translate known API sentinel strings (Unknown, N/A, No Plan, None).
 */
export function translateApiPlaceholder(value?: string | null): string {
  if (!value) return t('common.notSet')
  const key = API_PLACEHOLDER_MAP[value]
  return key ? t(key) : value
}

/**
 * Subscription status label by status ID (matches SubscriptionStatus constants).
 */
export function getSubscriptionStatusLabel(statusId?: number | null): string {
  const labels: Record<number, string> = {
    1: t('dealer.views.subscription.statusTrial'),
    2: t('dealer.views.subscription.statusActive'),
    3: t('dealer.views.subscription.statusExpired'),
    4: t('dealer.views.subscription.statusCanceled'),
    5: t('dealer.views.subscription.statusScheduled'),
  }
  if (statusId != null && labels[statusId]) {
    return labels[statusId]
  }
  return t('dealer.views.subscription.statusUnknown')
}

/**
 * Plan display name from slug with fallback to API plan_name.
 */
export function getPlanDisplayName(slug?: string | null, fallbackName?: string | null): string {
  if (slug) {
    const key = `common.plans.${slug}`
    const result = i18n.global.t(key)
    if (typeof result === 'string' && result !== key) {
      return result
    }
  }
  if (fallbackName) {
    return translateApiPlaceholder(fallbackName)
  }
  return t('dealer.views.analytics.noPlan')
}

export type AnalyticsFeatureLike = {
  key?: string
  feature_key?: string
  feature_name?: string
  label_en?: string | null
  label_da?: string | null
}

/**
 * Feature display name for analytics subscription usage section.
 */
export function getFeatureDisplayName(feature: AnalyticsFeatureLike): string {
  const key = feature.key || feature.feature_key || ''
  const locale = i18n.global.locale.value
  return featureDisplayName(
    { key, label_en: feature.label_en, label_da: feature.label_da },
    locale
  )
}

/**
 * Subscription status for analytics: prefer status_id, else translate raw status string.
 */
export function formatSubscriptionStatus(
  statusId?: number | null,
  status?: string | null
): string {
  if (statusId != null) {
    return getSubscriptionStatusLabel(statusId)
  }
  return translateApiPlaceholder(status)
}
