import type { SupportedLocale } from '@/plugins/i18n'

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'da']

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

/** BCP 47 tag for `Intl` / `toLocaleString` from app locale. */
export function getIntlLocale(locale?: SupportedLocale): string {
  return (locale ?? getDefaultLocale()) === 'da' ? 'da-DK' : 'en-US'
}
