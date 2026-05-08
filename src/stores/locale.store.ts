import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ensureLocaleLoaded, type SupportedLocale } from '@/plugins/i18n'

const validLocales: SupportedLocale[] = ['en', 'da']

function getStoredLocale(): SupportedLocale {
  return 'da'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<SupportedLocale>(getStoredLocale())

  async function setLocale(newLocale: SupportedLocale) {
    // Language switching is disabled for panel users; keep Danish fixed.
    if (!validLocales.includes(newLocale)) return
    locale.value = 'da'
    await ensureLocaleLoaded('da')
  }

  return {
    locale,
    setLocale,
  }
})
