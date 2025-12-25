/**
 * API Configuration
 * 
 * Centralized configuration for API base URL, version, and timeout settings.
 * Uses VITE_API_BASE_URL environment variable if available.
 */

const API_VERSION = 'v1'
const DEFAULT_BASE_URL = '/api/v1'
const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * Get the base URL for API requests
 * Uses VITE_API_BASE_URL if set, otherwise defaults to /api/v1
 */
export function getBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL
  
  if (envBaseUrl) {
    // Ensure it ends with /api/v1 or add it
    if (envBaseUrl.endsWith('/api/v1')) {
      return envBaseUrl
    }
    if (envBaseUrl.endsWith('/api')) {
      return `${envBaseUrl}/${API_VERSION}`
    }
    return `${envBaseUrl}/api/${API_VERSION}`
  }
  
  return DEFAULT_BASE_URL
}

/**
 * API configuration constants
 */
export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  version: API_VERSION,
  timeout: DEFAULT_TIMEOUT,
  contentType: 'application/json',
  accept: 'application/json',
} as const

/**
 * Helper to construct full API URL
 */
export function apiUrl(path: string): string {
  const base = API_CONFIG.baseUrl
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

