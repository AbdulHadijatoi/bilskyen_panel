import { createI18n } from 'vue-i18n'

export type SupportedLocale = 'en' | 'da'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {},
})

const localeModules = import.meta.glob<{ default: Record<string, unknown> }>('../locales/*.json')

/**
 * Load messages for a locale via dynamic import and set them on the global i18n instance.
 * Also sets the current locale.
 */
export async function loadLocaleMessages(locale: SupportedLocale): Promise<void> {
  const loader = localeModules[`../locales/${locale}.json`]
  if (!loader) return
  const mod = await loader()
  const messages = mod.default
  i18n.global.setLocaleMessage(locale, messages)
  i18n.global.locale.value = locale
}

const loadedLocales = new Set<SupportedLocale>()

/**
 * Ensure a locale's messages are loaded; if not, load them. Then set locale.
 */
export async function ensureLocaleLoaded(locale: SupportedLocale): Promise<void> {
  if (!loadedLocales.has(locale)) {
    const loader = localeModules[`../locales/${locale}.json`]
    if (loader) {
      const mod = await loader()
      i18n.global.setLocaleMessage(locale, mod.default)
      loadedLocales.add(locale)
    }
  }
  i18n.global.locale.value = locale
}

export default i18n
