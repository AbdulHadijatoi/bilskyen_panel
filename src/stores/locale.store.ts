import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ensureLocaleLoaded, type SupportedLocale } from '@/plugins/i18n'
import vuetify from '@/plugins/vuetify'
import {
  getInitialLocale,
  LOCALE_STORAGE_KEY,
} from '@/utils/defaultLocale'

const validLocales: SupportedLocale[] = ['en', 'da']

function syncVuetifyLocale(locale: SupportedLocale) {
  vuetify.locale.current.value = locale
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<SupportedLocale>(getInitialLocale())

  async function setLocale(newLocale: SupportedLocale) {
    if (!validLocales.includes(newLocale) || locale.value === newLocale) return

    locale.value = newLocale
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    await ensureLocaleLoaded(newLocale)
    syncVuetifyLocale(newLocale)
  }

  async function initialize() {
    const initialLocale = getInitialLocale()
    locale.value = initialLocale
    await ensureLocaleLoaded(initialLocale)
    syncVuetifyLocale(initialLocale)
  }

  return {
    locale,
    setLocale,
    initialize,
  }
})
