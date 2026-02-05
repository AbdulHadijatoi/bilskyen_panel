import { computed, onMounted } from 'vue'
import { useTranslationStore } from '../stores/translations'

export function useTranslation() {
  const store = useTranslationStore()

  // Load translations on mount
  onMounted(() => {
    store.loadTranslations()
  })

  const trans = (key: string, replace?: Record<string, string>): string => {
    return store.getTranslation(key, replace)
  }

  const currentLocale = computed(() => store.locale)
  const isLoading = computed(() => store.loading)

  const setLocale = (locale: string) => {
    store.setLocale(locale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_locale', locale)
    }
    store.loadTranslations(true) // Force reload
  }

  return {
    trans,
    currentLocale,
    isLoading,
    setLocale,
    reload: () => store.loadTranslations(true),
  }
}
