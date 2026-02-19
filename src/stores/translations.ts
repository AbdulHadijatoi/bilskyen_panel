import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Translation {
  key: string
  value: string
}

const STORAGE_KEY = 'translations_cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export const useTranslationStore = defineStore('translations', () => {
  // State
  const translations = ref<Record<string, string>>({})
  const locale = ref<string>('en')
  const loading = ref<boolean>(false)
  const lastFetch = ref<number>(0)

  // Computed
  const isCacheValid = computed(() => {
    return Date.now() - lastFetch.value < CACHE_EXPIRY
  })

  // Helper to get from localStorage
  function getStoredTranslations(): Record<string, string> | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${locale.value}`)
      if (!stored || typeof stored !== 'string') return null
      const trimmed = stored.trim()
      if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return null

      const data = JSON.parse(stored)
      if (Date.now() - data.timestamp < CACHE_EXPIRY) {
        return data.translations
      }
    } catch (e) {
      console.error('Error reading translations from localStorage', e)
    }
    
    return null
  }

  // Helper to save to localStorage
  function saveToStorage(translationsData: Record<string, string>) {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(
        `${STORAGE_KEY}_${locale.value}`,
        JSON.stringify({
          translations: translationsData,
          timestamp: Date.now(),
        })
      )
    } catch (e) {
      console.error('Error saving translations to localStorage', e)
    }
  }

  // Actions
  const setLocale = (newLocale: string) => {
    locale.value = newLocale
    // Try to load from cache
    const cached = getStoredTranslations()
    if (cached) {
      translations.value = cached
    } else {
      translations.value = {}
    }
  }

  const loadTranslations = async (force = false) => {
    // Check cache first
    if (!force && isCacheValid.value && Object.keys(translations.value).length > 0) {
      return
    }

    // Try localStorage
    const stored = getStoredTranslations()
    if (stored && !force) {
      translations.value = stored
      lastFetch.value = Date.now()
      return
    }

    // Fetch from API
    loading.value = true
    try {
      const response = await fetch(`/api/v1/admin/translations/export?locale=${locale.value}`)
      if (!response.ok) {
        throw new Error('Failed to fetch translations')
      }
      
      const data = await response.json()
      if (data.success && data.data) {
        const translationsMap: Record<string, string> = {}
        data.data.forEach((item: { key: string; [locale: string]: string }) => {
          translationsMap[item.key] = item[locale.value] || item.default_value || item.key
        })
        
        translations.value = translationsMap
        lastFetch.value = Date.now()
        saveToStorage(translationsMap)
      }
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      loading.value = false
    }
  }

  const getTranslation = (key: string, replace?: Record<string, string>): string => {
    let translation = translations.value[key] || key

    // Replace placeholders
    if (replace) {
      Object.entries(replace).forEach(([search, value]) => {
        translation = translation.replace(new RegExp(`:${search}`, 'g'), String(value))
        translation = translation.replace(new RegExp(`\\{${search}\\}`, 'g'), String(value))
      })
    }

    return translation
  }

  const clearCache = () => {
    translations.value = {}
    lastFetch.value = 0
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_KEY)) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Initialize locale from localStorage or default
  if (typeof window !== 'undefined') {
    const storedLocale = localStorage.getItem('app_locale')
    if (storedLocale) {
      locale.value = storedLocale
    }
  }

  return {
    // State
    translations,
    locale,
    loading,
    // Computed
    isCacheValid,
    // Actions
    setLocale,
    loadTranslations,
    getTranslation,
    clearCache,
  }
})
