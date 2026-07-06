import type { SupportedLocale } from '@/plugins/i18n'

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'da']

export const LOCALE_STORAGE_KEY = 'app_locale'

/**
 * Default UI locale from VITE_APP_LOCALE (build-time). Falls back to Danish for production.
 */
export function getDefaultLocale(): SupportedLocale {
  const fromEnv = import.meta.env.VITE_APP_LOCALE
  if (fromEnv && SUPPORTED_LOCALES.includes(fromEnv as SupportedLocale)) {
    return fromEnv as SupportedLocale
  }
  return 'da'
}

export function getStoredLocale(): SupportedLocale | null {
  if (typeof localStorage === 'undefined') return null

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale
  }

  return null
}

/** User preference from localStorage, otherwise build-time default. */
export function getInitialLocale(): SupportedLocale {
  return getStoredLocale() ?? getDefaultLocale()
}

/** Locale for API Accept-Language header (no Pinia dependency). */
export function getRequestLocale(): SupportedLocale {
  return getInitialLocale()
}

/** BCP 47 tag for `Intl` / `toLocaleString` from app locale. */
export function getIntlLocale(locale?: SupportedLocale): string {
  return (locale ?? getInitialLocale()) === 'da' ? 'da-DK' : 'en-US'
}
