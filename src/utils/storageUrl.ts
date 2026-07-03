import { API_CONFIG } from '@/config/api'

/**
 * Backend origin for public storage assets (strip /api/v1 from VITE_API_BASE_URL).
 */
export function getApiOrigin(): string {
  const baseUrl = API_CONFIG.baseUrl

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    const url = new URL(baseUrl)
    return url.origin
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

/**
 * Resolve a storage asset URL so it loads from the Laravel backend, not the Vite dev server.
 * Handles relative paths, raw storage paths, and legacy full URLs with the wrong host/port.
 */
export function resolveStorageAssetUrl(url: string | undefined | null): string | undefined {
  if (!url?.trim()) {
    return undefined
  }

  const trimmed = url.trim()
  const origin = getApiOrigin()
  if (!origin) {
    return trimmed
  }

  const storagePathMatch = trimmed.match(/(?:^|\/)storage\/(.+)$/)
  if (storagePathMatch) {
    const relativePath = `/storage/${storagePathMatch[1]}`
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      return relativePath
    }
    return `${origin}${relativePath}`
  }

  if (trimmed.startsWith('vehicles/3d-views/')) {
    const relativePath = `/storage/${trimmed}`
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      return relativePath
    }
    return `${origin}${relativePath}`
  }

  return trimmed
}
