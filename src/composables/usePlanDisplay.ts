import { useI18n } from 'vue-i18n'
import { featureDisplayName } from '@/utils/featureDisplay'

export type PlanLike = {
  id: number
  name: string
  slug: string
  description?: string
  is_active?: boolean
  billing_model?: 'subscription' | 'usage_daily'
  price_per_listing_per_day?: number | null
  features?: any[]
  price_history?: any[]
  priceHistory?: any[]
  trial_days?: number | null
}

export type BillingCycle = 'monthly' | 'yearly'

export function getFeatureValueTypeId(feature: any): number | undefined {
  return feature.feature_value_type_id || feature.featureValueType?.id || feature.feature_value_type?.id
}

export function getFeatureValue(feature: any): string | number | boolean | undefined {
  return feature.pivot?.value ?? feature.value
}

export function isTruthyFeatureValue(value: unknown): boolean {
  if (value === 0 || value === '0') return false
  return value === 'true' || value === '1' || value === true || value === 1
}

export function isMeaningfulFeatureValue(value: unknown, valueTypeId?: number): boolean {
  if (value === undefined || value === null || value === '') return false
  if (valueTypeId === 1) return isTruthyFeatureValue(value)
  if (valueTypeId === 2 || valueTypeId === 3) {
    const numeric = Number(value)
    if (!Number.isNaN(numeric) && numeric === 0) return false
    return true
  }
  return true
}

export function getCurrentPricing(plan: PlanLike) {
  const priceHistory = plan.priceHistory || plan.price_history || []
  if (priceHistory.length === 0) return null

  const activePricing = priceHistory.filter(
    (p: any) => !p.ends_at || new Date(p.ends_at) > new Date()
  )
  if (activePricing.length === 0) return null

  const monthly = activePricing.find((p: any) => p.billing_cycle === 'monthly')
  const yearly = activePricing.find((p: any) => p.billing_cycle === 'yearly')

  return { monthly, yearly }
}

/** Largest yearly-vs-monthly savings % across subscription plans (for billing toggle badge). */
export function computeMaxYearlyDiscountPercent(plans: PlanLike[]): number | null {
  let max = 0
  let found = false
  for (const plan of plans) {
    if (plan.billing_model === 'usage_daily') continue
    const pricing = getCurrentPricing(plan)
    const monthlyPrice = pricing?.monthly?.price
    const yearlyPrice = pricing?.yearly?.price
    if (!monthlyPrice || !yearlyPrice) continue
    const monthlyAnnual = monthlyPrice * 12
    if (monthlyAnnual <= 0) continue
    const savings = monthlyAnnual - yearlyPrice
    if (savings <= 0) continue
    const pct = Math.round((savings / monthlyAnnual) * 100)
    max = Math.max(max, pct)
    found = true
  }
  return found ? max : null
}

export function usePlanDisplay() {
  const { locale } = useI18n()

  const formatPrice = (priceInCents: number, currency: string) => {
    const price = priceInCents / 100
    return `${price.toFixed(2)} ${currency}`
  }

  const getFilteredFeatures = (plan: PlanLike) => {
    if (!plan.features || plan.features.length === 0) return []

    return plan.features.filter((feature: any) => {
      const valueTypeId = getFeatureValueTypeId(feature)
      const value = getFeatureValue(feature)
      return isMeaningfulFeatureValue(value, valueTypeId)
    })
  }

  const formatFeatureDisplay = (feature: any) => {
    const key = feature.key || ''
    const name = featureDisplayName(
      { key, label_en: feature.label_en, label_da: feature.label_da },
      locale.value
    )
    const valueTypeId = getFeatureValueTypeId(feature)
    const value = getFeatureValue(feature)

    if (valueTypeId === 1) {
      return name
    }

    if (valueTypeId === 2 || valueTypeId === 3) {
      return `${name}: ${value}`
    }

    return name
  }

  const formatFeatureCellValue = (feature: any) => {
    const valueTypeId = getFeatureValueTypeId(feature)
    const value = getFeatureValue(feature)

    if (valueTypeId === 1) {
      return isTruthyFeatureValue(value) ? { type: 'boolean' as const, included: true } : { type: 'missing' as const }
    }

    if (valueTypeId === 2 || valueTypeId === 3) {
      if (!isMeaningfulFeatureValue(value, valueTypeId)) {
        return { type: 'missing' as const }
      }
      return { type: 'value' as const, display: String(value) }
    }

    return { type: 'missing' as const }
  }

  const getPlanFeature = (plan: PlanLike, featureKey: string) => {
    return plan.features?.find((f: any) => f.key === featureKey)
  }

  const isUsagePlan = (plan: PlanLike) => plan.billing_model === 'usage_daily'

  const isPopularPlan = (plan: PlanLike) => plan.slug === 'professional'

  const plansHaveBothCycles = (plans: PlanLike[]) => {
    return plans.some((plan) => {
      if (isUsagePlan(plan)) return false
      const pricing = getCurrentPricing(plan)
      return Boolean(pricing?.monthly && pricing?.yearly)
    })
  }

  const getDisplayPrice = (plan: PlanLike, billingCycle: BillingCycle) => {
    if (isUsagePlan(plan)) {
      return {
        primary: formatPrice(plan.price_per_listing_per_day || 0, 'DKK'),
        suffix: 'perListingPerDay' as const,
        secondary: null,
      }
    }

    const pricing = getCurrentPricing(plan)
    if (!pricing) return null

    const selected = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly
    const alternate = billingCycle === 'yearly' ? pricing.monthly : pricing.yearly

    if (!selected) {
      const fallback = pricing.monthly || pricing.yearly
      if (!fallback) return null
      return {
        primary: formatPrice(fallback.price, fallback.currency),
        suffix: billingCycle === 'yearly' && fallback.billing_cycle === 'yearly' ? 'perYear' as const : 'perMonth' as const,
        secondary: null,
      }
    }

    return {
      primary: formatPrice(selected.price, selected.currency),
      suffix: billingCycle === 'yearly' ? 'perYear' as const : 'perMonth' as const,
      secondary:
        alternate && pricing.monthly && pricing.yearly
          ? formatPrice(alternate.price, alternate.currency)
          : null,
    }
  }

  return {
    getCurrentPricing,
    formatPrice,
    getFilteredFeatures,
    formatFeatureDisplay,
    formatFeatureCellValue,
    getPlanFeature,
    isUsagePlan,
    isPopularPlan,
    plansHaveBothCycles,
    getDisplayPrice,
  }
}
