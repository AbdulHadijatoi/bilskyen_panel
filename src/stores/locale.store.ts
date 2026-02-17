import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ensureLocaleLoaded, type SupportedLocale } from '@/plugins/i18n'

const STORAGE_KEY = 'panel_locale'

const validLocales: SupportedLocale[] = ['en', 'da']

function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && validLocales.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale
    }
  } catch (e) {
    console.error('Error reading locale from localStorage', e)
  }
  return 'en'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<SupportedLocale>(getStoredLocale())

  async function setLocale(newLocale: SupportedLocale) {
    locale.value = newLocale
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLocale)
      } catch (e) {
        console.error('Error saving locale to localStorage', e)
      }
    }
    await ensureLocaleLoaded(newLocale)
  }

  return {
    locale,
    setLocale,
  }
})
