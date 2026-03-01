/**
 * Resolve a user-facing error message from an API error, using i18n for fallbacks.
 * Use when displaying API errors (e.g. in snackbars). Prefers the message from the API
 * (which may already be translated by the backend); falls back to translated error_code or generic.
 */
import type { ApiErrorModel } from '@/models/api-error.model'
import { useI18n } from 'vue-i18n'

export function useErrorMessage() {
  const { t } = useI18n()

  function getDisplayMessage(error: ApiErrorModel | null | undefined): string {
    if (!error) return t('errors.generic')
    if (error.message && String(error.message).trim()) return error.message
    const code = error.error_code
    if (code && typeof code === 'string') {
      const key = `errors.${code}`
      const translated = t(key)
      if (translated !== key) return translated
    }
    return t('errors.generic')
  }

  return { getDisplayMessage }
}
