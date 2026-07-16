import type { PlanLike } from '@/composables/usePlanDisplay'
import { getFeatureValueTypeId, getFeatureValue, isTruthyFeatureValue, isMeaningfulFeatureValue } from '@/composables/usePlanDisplay'
import { featureDisplayName } from '@/utils/featureDisplay'

export type FeatureCategory =
  | 'inventory'
  | 'leads'
  | 'analytics'
  | 'ai'
  | 'marketing'
  | 'admin'
  | 'other'

export type ComparisonCellValue =
  | { type: 'boolean'; included: true }
  | { type: 'value'; display: string }
  | { type: 'missing' }

export type ComparisonRow = {
  featureKey: string
  featureId: number
  label: string
  description?: string | null
  category: FeatureCategory
  valueTypeId: number | undefined
  cells: Record<number, ComparisonCellValue>
}

export type ComparisonGroup = {
  category: FeatureCategory
  rows: ComparisonRow[]
}

const CATEGORY_ORDER: FeatureCategory[] = [
  'inventory',
  'leads',
  'analytics',
  'ai',
  'marketing',
  'admin',
  'other',
]

const FEATURE_CATEGORY_MAP: Record<string, FeatureCategory> = {
  max_listings: 'inventory',
  max_vehicle_images: 'inventory',
  max_equipment_per_vehicle: 'inventory',
  max_feature_listings: 'inventory',
  auto_feature_listings: 'inventory',
  listing_boost: 'inventory',
  upload_3d_view: 'inventory',
  listing_health_inbox: 'inventory',
  listing_health_actions: 'inventory',
  listing_health_ai_fixes: 'inventory',
  listing_health_ai_briefing: 'inventory',
  listing_health_equipment_gap: 'inventory',
  listing_health_price_apply: 'inventory',
  listing_health_before_after: 'inventory',
  bulk_price_update: 'inventory',
  branded_inventory_audit: 'inventory',
  enquiry_management: 'leads',
  lead_management: 'leads',
  lead_auto_assign: 'leads',
  lead_sla_alerts: 'leads',
  lead_task_board: 'leads',
  enquiry_ai_replies: 'leads',
  lead_ai_summary: 'leads',
  deal_builder: 'leads',
  analytics: 'analytics',
  advanced_analytics: 'analytics',
  analytics_pdf_export: 'analytics',
  analytics_listing_funnel: 'analytics',
  analytics_dealer_benchmark: 'analytics',
  market_pulse: 'analytics',
  pricing_intelligence: 'analytics',
  price_change_alerts: 'analytics',
  ai_assistant: 'ai',
  ai_monthly_requests: 'ai',
  staff_management: 'admin',
  audit_logs: 'admin',
  api_access: 'admin',
  priority_support: 'admin',
  dms_sync: 'admin',
  finance_calculator_dealer: 'admin',
  review_management: 'admin',
  dealer_trust_badge: 'admin',
  premium_dealer_badge: 'admin',
  inventory_feeds: 'marketing',
  syndication: 'marketing',
  syndication_channels: 'marketing',
  marketing_campaigns: 'marketing',
  retargeting: 'marketing',
}

function getFeatureCategory(key: string): FeatureCategory {
  return FEATURE_CATEGORY_MAP[key] || 'other'
}

export { getFeatureCategory }

function shouldIncludeFeatureInComparison(feature: any): boolean {
  const valueTypeId = getFeatureValueTypeId(feature)
  const value = getFeatureValue(feature)
  return isMeaningfulFeatureValue(value, valueTypeId)
}

function collectUniqueFeatures(plans: PlanLike[]): any[] {
  const byKey = new Map<string, any>()

  for (const plan of plans) {
    for (const feature of plan.features || []) {
      const key = feature.key
      if (!key || byKey.has(key)) continue
      if (shouldIncludeFeatureInComparison(feature)) {
        byKey.set(key, feature)
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(getFeatureCategory(a.key))
    const catB = CATEGORY_ORDER.indexOf(getFeatureCategory(b.key))
    if (catA !== catB) return catA - catB
    return (a.key || '').localeCompare(b.key || '')
  })
}

function buildCellForPlan(plan: PlanLike, featureKey: string): ComparisonCellValue {
  const feature = plan.features?.find((f: any) => f.key === featureKey)
  if (!feature) return { type: 'missing' }

  const valueTypeId = getFeatureValueTypeId(feature)
  const value = getFeatureValue(feature)

  if (valueTypeId === 1) {
    return isTruthyFeatureValue(value) ? { type: 'boolean', included: true } : { type: 'missing' }
  }

  if (valueTypeId === 2 || valueTypeId === 3) {
    if (!isMeaningfulFeatureValue(value, valueTypeId)) {
      return { type: 'missing' }
    }
    return { type: 'value', display: String(value) }
  }

  return { type: 'missing' }
}

export function buildComparisonMatrix(plans: PlanLike[], locale: string): ComparisonGroup[] {
  const features = collectUniqueFeatures(plans)
  const grouped = new Map<FeatureCategory, ComparisonRow[]>()

  for (const feature of features) {
    const category = getFeatureCategory(feature.key)
    const rows = grouped.get(category) || []
    const cells: Record<number, ComparisonCellValue> = {}

    for (const plan of plans) {
      cells[plan.id] = buildCellForPlan(plan, feature.key)
    }

    const hasAnyValue = Object.values(cells).some((cell) => cell.type !== 'missing')
    if (!hasAnyValue) continue

    rows.push({
      featureKey: feature.key,
      featureId: feature.id,
      label: featureDisplayName(
        { key: feature.key, label_en: feature.label_en, label_da: feature.label_da },
        locale
      ),
      description: feature.description ?? null,
      category,
      valueTypeId: getFeatureValueTypeId(feature),
      cells,
    })

    grouped.set(category, rows)
  }

  return CATEGORY_ORDER.filter((category) => grouped.has(category)).map((category) => ({
    category,
    rows: grouped.get(category) || [],
  }))
}

export function splitPlansByBillingModel(plans: PlanLike[]) {
  const subscriptionPlans = plans.filter((p) => p.billing_model !== 'usage_daily')
  const paygPlans = plans.filter((p) => p.billing_model === 'usage_daily')
  return { subscriptionPlans, paygPlans }
}
