export const AUTH_ROUTE_BASE = '/auth'
export const DEALER_ROUTE_BASE = '/'
export const USER_ROUTE_BASE = '/'
export const ADMIN_ROUTE_BASE = '/admin'
export const API_ROUTE_BASE = '/api'
export const API_DEALER_BASE = '/dealer' // API endpoint base (different from frontend route)

export const APP = {
  NAME: 'Bilskyen',
  DESCRIPTION: 'Revolutionizing Dealership Management',
  MARKETPLACE_URL: import.meta.env.VITE_MARKETPLACE_URL || 'http://localhost:8000',
} as const

