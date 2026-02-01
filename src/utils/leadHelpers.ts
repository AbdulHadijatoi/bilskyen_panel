/**
 * Lead Helper Utilities
 * 
 * Helper functions for lead intent, category, and stage display
 */

import { LeadIntent, LeadStage } from '@/models/lead.model'

/**
 * Lead Intent display names
 */
export const LEAD_INTENT_NAMES: Record<number, string> = {
  [LeadIntent.LOW]: 'Low',
  [LeadIntent.MEDIUM]: 'Medium',
  [LeadIntent.HIGH]: 'High',
  [LeadIntent.VERY_HIGH]: 'Very High',
}

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
 * Lead Category display names
 */
export const LEAD_CATEGORY_NAMES: Record<number, string> = {
  1: 'Price Negotiation',
  2: 'Financing Request',
  3: 'WhatsApp Clicked',
  4: 'Email Clicked',
  5: 'Enquiry Form',
  6: 'Phone Revealed',
  7: 'Test Drive Request',
}

/**
 * Lead Stage display names
 */
export const LEAD_STAGE_NAMES: Record<number, string> = {
  [LeadStage.NEW]: 'New',
  [LeadStage.CONTACTED]: 'Contacted',
  [LeadStage.QUALIFIED]: 'Qualified',
  [LeadStage.QUOTED]: 'Quoted',
  [LeadStage.NEGOTIATING]: 'Negotiating',
  [LeadStage.WON]: 'Won',
  [LeadStage.LOST]: 'Lost',
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

/**
 * Get lead intent display name
 */
export function getLeadIntentName(intentId?: number | null): string {
  if (!intentId) return 'Not Set'
  return LEAD_INTENT_NAMES[intentId] || 'Unknown'
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
  if (!categoryId) return 'Not Set'
  return LEAD_CATEGORY_NAMES[categoryId] || 'Unknown'
}

/**
 * Get lead stage display name
 */
export function getLeadStageName(stageId: number): string {
  return LEAD_STAGE_NAMES[stageId] || 'Unknown'
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

/**
 * Format date for display
 */
export function formatLeadDate(date?: string | null): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

/**
 * Format full date for display
 */
export function formatLeadDateFull(date?: string | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
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
  return Object.entries(LEAD_INTENT_NAMES).map(([id, name]) => ({
    id: Number(id),
    name,
    color: LEAD_INTENT_COLORS[Number(id)],
  }))
}

/**
 * Get category options for select
 */
export function getCategoryOptions() {
  return Object.entries(LEAD_CATEGORY_NAMES).map(([id, name]) => ({
    id: Number(id),
    name,
  }))
}

/**
 * Get stage options for select
 */
export function getStageOptions() {
  return Object.entries(LEAD_STAGE_NAMES).map(([id, name]) => ({
    id: Number(id),
    name,
    color: LEAD_STAGE_COLORS[Number(id)],
  }))
}
