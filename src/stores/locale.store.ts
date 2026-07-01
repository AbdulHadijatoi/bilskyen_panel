import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ensureLocaleLoaded, type SupportedLocale } from '@/plugins/i18n'
import { getDefaultLocale } from '@/utils/defaultLocale'

const validLocales: SupportedLocale[] = ['en', 'da']

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<SupportedLocale>(getDefaultLocale())

  async function setLocale(newLocale: SupportedLocale) {
    // Language switching is disabled for panel users; locale is fixed via VITE_APP_LOCALE.
    if (!validLocales.includes(newLocale)) return
    const fixedLocale = getDefaultLocale()
    locale.value = fixedLocale
    await ensureLocaleLoaded(fixedLocale)
  }

  return {
    locale,
    setLocale,
  }
})
