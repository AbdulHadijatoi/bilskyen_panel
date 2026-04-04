/**
 * Shared helpers for subscription feature labels (admin-managed label_en / label_da).
 */

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

/**
 * Visible name for the current UI locale. Danish uses label_da when set, else label_en, else formatted key.
 */
export function featureDisplayName(feature: FeatureLike, locale: string): string {
  const useDa = locale === 'da'
  const da = feature.label_da?.trim()
  const en = feature.label_en?.trim()
  if (useDa && da) return da
  if (en) return en
  return formatFeatureKeyFromSnake(feature.key || '')
}
