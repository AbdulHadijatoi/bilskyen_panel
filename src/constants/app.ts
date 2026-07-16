export const AUTH_ROUTE_BASE = '/auth'
export const DEALER_ROUTE_BASE = '/'
export const USER_ROUTE_BASE = '/'
export const ADMIN_ROUTE_BASE = '/admin'
export const API_ROUTE_BASE = '/api'
export const API_DEALER_BASE = '/dealer' // API endpoint base (different from frontend route)

/**
 * Public marketplace / Laravel site origin.
 * Prefer VITE_MARKETPLACE_URL; otherwise derive from the current panel host
 * (panel.example.com → https://example.com). Never bake localhost into production.
 */
export function resolveMarketplaceUrl(): string {
  const fromEnv = String(import.meta.env.VITE_MARKETPLACE_URL || '').trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname, origin } = window.location
    if (hostname.startsWith('panel.')) {
      return `${protocol}//${hostname.slice('panel.'.length)}`
    }
    return origin
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8000'
  }

  return ''
}

export const APP = {
  NAME: 'Bilskyen',
  DESCRIPTION: 'Revolutionizing Dealership Management',
  get MARKETPLACE_URL(): string {
    return resolveMarketplaceUrl()
  },
} as const
