/**
 * Shared helpers for subscription feature labels (admin-managed label_en / label_da).
 */

import i18n from '@/plugins/i18n'

export function formatFeatureKeyFromSnake(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export type FeatureLike = {
  key: string
  label_en?: string | null
  label_da?: string | null
}

function featureKeyI18nLabel(key: string): string | null {
  if (!key) return null
  const i18nKey = `common.featureKeys.${key}`
  const result = i18n.global.t(i18nKey)
  return typeof result === 'string' && result !== i18nKey ? result : null
}

/**
 * Visible name for the current UI locale. Danish uses label_da when set, else label_en, else i18n key, else formatted key.
 */
export function featureDisplayName(feature: FeatureLike, locale: string): string {
  const useDa = locale === 'da'
  const da = feature.label_da?.trim()
  const en = feature.label_en?.trim()
  if (useDa && da) return da
  if (en) return en
  const i18nLabel = featureKeyI18nLabel(feature.key || '')
  if (i18nLabel) return i18nLabel
  return formatFeatureKeyFromSnake(feature.key || '')
}
