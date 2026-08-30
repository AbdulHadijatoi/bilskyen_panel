/**
 * Lead Helper Utilities
 *
 * Helper functions for lead intent, category, and stage display
 */

import { LeadIntent, LeadStage, type LeadModel } from '@/models/lead.model'
import i18n from '@/plugins/i18n'
import { useLeadStagesStore } from '@/stores/leadStages.store'

/**
 * Lead Intent colors (Vuetify color names)
 */
export const LEAD_INTENT_COLORS: Record<number, string> = {
  [LeadIntent.LOW]: 'grey',
  [LeadIntent.MEDIUM]: 'yellow',
  [LeadIntent.HIGH]: 'orange',
  [LeadIntent.VERY_HIGH]: 'red',
}

/**
 * Lead Stage colors (Vuetify color names)
 */
export const LEAD_STAGE_COLORS: Record<number, string> = {
  [LeadStage.NEW]: 'blue',
  [LeadStage.CONTACTED]: 'cyan',
  [LeadStage.QUALIFIED]: 'green',
  [LeadStage.QUOTED]: 'orange',
  [LeadStage.NEGOTIATING]: 'purple',
  [LeadStage.WON]: 'success',
  [LeadStage.LOST]: 'error',
}

function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params ?? {})
}

function translateById(group: 'leadCategories' | 'leadStages' | 'leadIntents', id: number): string {
  const key = `common.${group}.${id}`
  const result = i18n.global.t(key)
  return typeof result === 'string' ? result : String(id)
}

/**
 * Get lead intent display name
 */
export function getLeadIntentName(intentId?: number | null): string {
  if (!intentId) return t('common.notSet')
  return translateById('leadIntents', intentId)
}

/**
 * Get lead intent color
 */
export function getLeadIntentColor(intentId?: number | null): string {
  if (!intentId) return 'grey'
  return LEAD_INTENT_COLORS[intentId] || 'grey'
}

/**
 * Get lead category display name
 */
export function getLeadCategoryName(categoryId?: number | null): string {
  if (!categoryId) return t('common.notSet')
  return translateById('leadCategories', categoryId)
}

/**
 * Get lead stage display name
 */
export function getLeadStageName(stageId: number): string {
  const store = useLeadStagesStore()
  const dbName = store.getStageName(stageId)
  if (dbName) return dbName
  return translateById('leadStages', stageId)
}

/**
 * Get lead source display name
 */
export function getLeadSourceName(source?: string | null): string {
  if (!source) return t('common.leadSources.Unknown')
  const key = `common.leadSources.${source}`
  const result = i18n.global.t(key)
  return typeof result === 'string' && result !== key ? result : source
}

/**
 * Get lead stage color
 */
export function getLeadStageColor(stageId: number): string {
  return LEAD_STAGE_COLORS[stageId] || 'grey'
}

// Aliases for convenience
export const getStageName = getLeadStageName
export const getStageColor = getLeadStageColor
export const getIntentName = getLeadIntentName
export const getIntentColor = getLeadIntentColor
export const getCategoryName = getLeadCategoryName
export const getSourceName = getLeadSourceName

export const TRAFFIC_SOURCE_META = 'meta'
export const TRAFFIC_SOURCE_OTHER = 'other'

export function getLeadEffectiveTrafficSource(lead: Pick<LeadModel, 'effectiveTrafficSource' | 'trafficSource'>): string {
  return lead.effectiveTrafficSource || lead.trafficSource || TRAFFIC_SOURCE_OTHER
}

export function getLeadTrafficChannelLabel(lead: Pick<LeadModel, 'effectiveTrafficSource' | 'trafficSource'>): string {
  return getLeadEffectiveTrafficSource(lead) === TRAFFIC_SOURCE_META
    ? t('common.leadAttribution.channelMeta')
    : t('common.leadAttribution.channelWeb')
}

export function getLeadTrafficChannelColor(lead: Pick<LeadModel, 'effectiveTrafficSource' | 'trafficSource'>): string {
  return getLeadEffectiveTrafficSource(lead) === TRAFFIC_SOURCE_META ? 'blue' : 'grey'
}

export function hasLeadAttribution(lead: Pick<LeadModel, 'utmSource' | 'utmMedium' | 'utmCampaign' | 'referrerUrl' | 'trafficSource' | 'effectiveTrafficSource'>): boolean {
  return !!(
    lead.utmSource
    || lead.utmMedium
    || lead.utmCampaign
    || lead.referrerUrl
    || lead.trafficSource
    || lead.effectiveTrafficSource
  )
}

/**
 * Format date for display
 */
export function formatLeadDate(date?: string | null): string {
  if (!date) return t('common.na')
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('common.justNow')
  if (diffMins < 60) return t('common.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('common.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('common.daysAgo', { count: diffDays })

  return d.toLocaleDateString('da-DK', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Format full date for display
 */
export function formatLeadDateFull(date?: string | null): string {
  if (!date) return t('common.na')
  return new Date(date).toLocaleString('da-DK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get intent options for select
 */
export function getIntentOptions() {
  return Object.keys(LEAD_INTENT_COLORS).map((id) => ({
    id: Number(id),
    name: getLeadIntentName(Number(id)),
    color: LEAD_INTENT_COLORS[Number(id)],
  }))
}

/**
 * Get category options for select
 */
export function getCategoryOptions() {
  return [1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({
    id,
    name: getLeadCategoryName(id),
  }))
}

/**
 * Get stage options for select
 */
export function getStageOptions() {
  const store = useLeadStagesStore()
  if (store.loaded && store.stageOptions.length > 0) {
    return store.stageOptions
  }
  return Object.keys(LEAD_STAGE_COLORS).map((id) => ({
    id: Number(id),
    name: getLeadStageName(Number(id)),
    color: LEAD_STAGE_COLORS[Number(id)],
  }))
}
