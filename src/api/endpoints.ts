/**
 * API Endpoints
 * 
 * Centralized endpoint constants organized by feature
 * Easy to update for API version changes
 */

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PANEL_LOGIN: '/auth/panel-login', // For Vue.js admin panel (dealer/staff/admin only)
  PANEL_REFRESH: '/auth/panel-refresh', // For Vue.js admin panel token refresh
  STAFF_LOGIN: '/auth/staff-login', // For dealer staff members (username-based)
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  SIGN_OUT: '/auth/sign-out',
  GET_SESSION: '/auth/get-session',
  UPDATE_USER: '/auth/update-user',
  REVOKE_SESSION: '/auth/revoke-session',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forget-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const

/**
 * Public vehicle endpoints
 */
export const PUBLIC_VEHICLE_ENDPOINTS = {
  LIST: '/vehicles',
  SHOW: (id: number | string) => `/vehicles/${id}`,
} as const

/**
 * Public lookup endpoints
 */
export const PUBLIC_LOOKUP_ENDPOINTS = {
  LOCATIONS: '/locations',
  FUEL_TYPES: '/fuel-types',
  TRANSMISSIONS: '/transmissions',
} as const

/**
 * Dealer vehicle endpoints
 */
export const DEALER_VEHICLE_ENDPOINTS = {
  LIST: '/dealer/vehicles',
  SHOW: (id: number | string) => `/dealer/vehicles/show/${id}`,
  CREATE: '/dealer/vehicles',
  DRAFT: '/dealer/vehicles/draft',
  UPDATE: (id: number | string) => `/dealer/vehicles/update/${id}`,
  DELETE: (id: number | string) => `/dealer/vehicles/delete/${id}`,
  UPLOAD_IMAGES: (id: number | string) => `/dealer/vehicles/${id}/images`,
  DELETE_IMAGE: (vehicleId: number | string, imageId: number | string) =>
    `/dealer/vehicles/${vehicleId}/images/${imageId}`,
  UPDATE_STATUS: (id: number | string) => `/dealer/vehicles/update-status/${id}`,
  UPDATE_EQUIPMENT: (id: number | string) => `/dealer/vehicles/update-equipment/${id}`,
  UPDATE_PRICE: (id: number | string) => `/dealer/vehicles/${id}/price`,
  FETCH_FROM_NUMMERPLADE: '/dealer/vehicles/fetch-from-nummerplade',
} as const

/**
 * Dealer lookup endpoints
 */
export const DEALER_LOOKUP_ENDPOINTS = {
  LOOKUP_CONSTANTS: '/dealer/lookup-constants',
  VEHICLE_BY_REGISTRATION: '/dealer/lookup/vehicle-by-registration',
} as const

/**
 * Dealer lead endpoints
 */
export const DEALER_LEAD_ENDPOINTS = {
  LIST: '/dealer/leads',
  SHOW: (id: number | string) => `/dealer/leads/show/${id}`,
  ASSIGN: (id: number | string) => `/dealer/leads/assign/${id}`,
  UPDATE_STAGE: (id: number | string) => `/dealer/leads/stage/${id}`,
  UPDATE_INTENT: (id: number | string) => `/dealer/leads/intent/${id}`,
  UPDATE_CATEGORY: (id: number | string) => `/dealer/leads/category/${id}`,
  GET_MESSAGES: (id: number | string) => `/dealer/leads/messages/${id}`,
  SEND_MESSAGE: (id: number | string) => `/dealer/leads/messages/${id}`,
} as const

/**
 * Dealer enquiry endpoints
 */
export const DEALER_ENQUIRY_ENDPOINTS = {
  LIST: '/dealer/enquiries',
  SHOW: (id: number | string) => `/dealer/enquiries/show/${id}`,
  UPDATE_STATUS: (id: number | string) => `/dealer/enquiries/status/${id}`,
  UPDATE_TYPE: (id: number | string) => `/dealer/enquiries/type/${id}`,
} as const

/**
 * Dealer favorites endpoints
 */
export const DEALER_FAVORITE_ENDPOINTS = {
  LIST: '/dealer/favorites',
  CREATE: '/dealer/favorites',
  DELETE: (vehicleId: number | string) => `/dealer/favorites/${vehicleId}`,
} as const

/**
 * Dealer saved searches endpoints
 */
export const DEALER_SAVED_SEARCH_ENDPOINTS = {
  LIST: '/dealer/saved-searches',
  CREATE: '/dealer/saved-searches',
  DELETE: (id: number | string) => `/dealer/saved-searches/${id}`,
} as const

/**
 * Dealer profile endpoints
 */
export const DEALER_PROFILE_ENDPOINTS = {
  SHOW: '/dealer/profile',
  UPDATE: '/dealer/profile/update',
  LOGO: '/dealer/profile/logo',
} as const

/**
 * Dealer staff endpoints
 */
export const DEALER_STAFF_ENDPOINTS = {
  LIST: '/dealer/staff',
  CREATE: '/dealer/staff',
  UPDATE: (userId: number | string) => `/dealer/staff/${userId}`,
  DELETE: (userId: number | string) => `/dealer/staff/${userId}`,
} as const

/**
 * Dealer subscription endpoints
 */
export const DEALER_SUBSCRIPTION_ENDPOINTS = {
  SHOW: '/dealer/subscription',
  FEATURES: '/dealer/subscription/features',
  HISTORY: '/dealer/subscription/history',
  PLANS: '/dealer/plans',
  CREATE: '/dealer/subscription',
} as const

/**
 * Dealer dashboard endpoints
 */
export const DEALER_DASHBOARD_ENDPOINTS = {
  STATS: '/dealer/dashboard',
} as const

/**
 * Dealer audit endpoints
 */
export const DEALER_AUDIT_ENDPOINTS = {
  LOGS: '/dealer/audit-logs',
} as const

/**
 * Dealer analytics endpoints
 */
export const DEALER_ANALYTICS_ENDPOINTS = {
  OVERVIEW: '/dealer/analytics/overview',
  LEADS: '/dealer/analytics/leads',
  VEHICLES: '/dealer/analytics/vehicles',
  MARKETING: '/dealer/analytics/marketing',
  SUBSCRIPTION: '/dealer/analytics/subscription',
} as const

/**
 * Admin user endpoints
 */
export const ADMIN_USER_ENDPOINTS = {
  LIST: '/admin/users',
  SHOW: (id: number | string) => `/admin/users/show/${id}`,
  ROLES: '/admin/users/roles',
  CREATE: '/admin/users/create',
  UPDATE: (id: number | string) => `/admin/users/update/${id}`,
  DELETE: (id: number | string) => `/admin/users/delete/${id}`,
  UPDATE_STATUS: (id: number | string) => `/admin/users/update-status/${id}`,
  CHANGE_PASSWORD: (id: number | string) => `/admin/users/change-password/${id}`,
  CHANGE_OWN_PASSWORD: '/admin/change-password',
  BAN: (id: number | string) => `/admin/users/ban/${id}`,
  UNBAN: (id: number | string) => `/admin/users/unban/${id}`,
} as const

/**
 * Admin dealer endpoints
 */
export const ADMIN_DEALER_ENDPOINTS = {
  LIST: '/admin/dealers',
  LIST_MINIMAL: '/admin/dealers/list',
  SHOW: (id: number | string) => `/admin/dealers/${id}`,
  CREATE: '/admin/dealers',
  UPDATE: (id: number | string) => `/admin/dealers/${id}`,
  DELETE: (id: number | string) => `/admin/dealers/${id}`,
} as const

/**
 * Admin vehicle endpoints
 */
export const ADMIN_VEHICLE_ENDPOINTS = {
  LIST: '/admin/vehicles',
  SHOW: (id: number | string) => `/admin/vehicles/show/${id}`,
  IMAGES: (id: number | string) => `/admin/vehicles/images/${id}`,
  HISTORY: (id: number | string) => `/admin/vehicles/history/${id}`,
  UPDATE: (id: number | string) => `/admin/vehicles/update/${id}`,
  UPDATE_STATUS: (id: number | string) => `/admin/vehicles/update-status/${id}`,
  UPDATE_IMAGES: (id: number | string) => `/admin/vehicles/update-images/${id}`,
  DELETE_IMAGE: (id: number | string) => `/admin/vehicles/delete-image/${id}`,
  UPDATE_EQUIPMENT: (id: number | string) => `/admin/vehicles/update-equipment/${id}`,
  DELETE: (id: number | string) => `/admin/vehicles/delete/${id}`,
} as const

/**
 * Admin plan endpoints
 */
export const ADMIN_PLAN_ENDPOINTS = {
  LIST: '/admin/plans',
  SHOW: (id: number | string) => `/admin/plans/${id}`,
  CREATE: '/admin/plans',
  UPDATE: (id: number | string) => `/admin/plans/${id}`,
  DELETE: (id: number | string) => `/admin/plans/${id}`,
  FEATURES: (id: number | string) => `/admin/plans/${id}/features`,
  ASSIGN_FEATURE: (id: number | string) => `/admin/plans/${id}/features`,
  REMOVE_FEATURE: (planId: number | string, featureId: number | string) =>
    `/admin/plans/${planId}/features/${featureId}`,
  AVAILABILITY: (id: number | string) => `/admin/plans/${id}/availability`,
  SYNC_AVAILABILITY: (id: number | string) => `/admin/plans/${id}/availability`,
  PRICING: (id: number | string) => `/admin/plans/${id}/pricing`,
  UPDATE_PRICING: (id: number | string) => `/admin/plans/${id}/pricing`,
} as const

/**
 * Admin subscription endpoints
 */
export const ADMIN_SUBSCRIPTION_ENDPOINTS = {
  LIST: '/admin/subscriptions',
  SHOW: (id: number | string) => `/admin/subscriptions/${id}`,
  CREATE: '/admin/subscriptions',
  UPDATE: (id: number | string) => `/admin/subscriptions/${id}`,
  UPDATE_STATUS: (id: number | string) => `/admin/subscriptions/${id}/status`,
  CANCEL: (id: number | string) => `/admin/subscriptions/${id}/cancel`,
  RENEW: (id: number | string) => `/admin/subscriptions/${id}/renew`,
  DEALER_SUBSCRIPTIONS: (dealerId: number | string) => `/admin/subscriptions/dealer/${dealerId}`,
} as const

/**
 * Admin feature endpoints
 */
export const ADMIN_FEATURE_ENDPOINTS = {
  LIST: '/admin/features',
  SHOW: (id: number | string) => `/admin/features/${id}`,
  CREATE: '/admin/features',
  UPDATE: (id: number | string) => `/admin/features/${id}`,
  DELETE: (id: number | string) => `/admin/features/${id}`,
} as const

/**
 * Admin CMS page endpoints
 */
export const ADMIN_PAGE_ENDPOINTS = {
  LIST: '/admin/pages',
  SHOW: (id: number | string) => `/admin/pages/${id}`,
  CREATE: '/admin/pages',
  UPDATE: (id: number | string) => `/admin/pages/${id}`,
  DELETE: (id: number | string) => `/admin/pages/${id}`,
  PUBLISH: (id: number | string) => `/admin/pages/${id}/publish`,
} as const

/**
 * Admin home page content endpoints
 */
export const ADMIN_HOME_PAGE_ENDPOINTS = {
  LIST: '/admin/home-page-content',
  UPDATE: (sectionKey: string) => `/admin/home-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/home-page-content/bulk-update',
} as const

/**
 * Admin about page content endpoints
 */
export const ADMIN_ABOUT_PAGE_ENDPOINTS = {
  LIST: '/admin/about-page-content',
  UPDATE: (sectionKey: string) => `/admin/about-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/about-page-content/bulk-update',
  UPLOAD_IMAGE: '/admin/about-page-content/images/upload',
  DELETE_IMAGE: (imageId: number | string) => `/admin/about-page-content/images/${imageId}`,
} as const

/**
 * Admin contact page content endpoints
 */
export const ADMIN_CONTACT_PAGE_ENDPOINTS = {
  LIST: '/admin/contact-page-content',
  UPDATE: (sectionKey: string) => `/admin/contact-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/contact-page-content/bulk-update',
  UPLOAD_IMAGE: '/admin/contact-page-content/images/upload',
  DELETE_IMAGE: (imageId: number | string) => `/admin/contact-page-content/images/${imageId}`,
} as const

/**
 * Admin privacy page content endpoints
 */
export const ADMIN_PRIVACY_PAGE_ENDPOINTS = {
  LIST: '/admin/privacy-page-content',
  UPDATE: (sectionKey: string) => `/admin/privacy-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/privacy-page-content/bulk-update',
} as const

/**
 * Admin terms page content endpoints
 */
export const ADMIN_TERMS_PAGE_ENDPOINTS = {
  LIST: '/admin/terms-page-content',
  UPDATE: (sectionKey: string) => `/admin/terms-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/terms-page-content/bulk-update',
} as const

/**
 * Public home page content endpoints
 */
export const PUBLIC_HOME_PAGE_ENDPOINTS = {
  GET: '/home-page-content',
} as const

/**
 * Admin analytics endpoints
 */
export const ADMIN_ANALYTICS_ENDPOINTS = {
  OVERVIEW: '/admin/analytics/overview',
  REVENUE: '/admin/analytics/revenue',
  DEALERS: '/admin/analytics/dealers',
  VEHICLES: '/admin/analytics/vehicles',
  LEADS: '/admin/analytics/leads',
  ACTIVITY: '/admin/analytics/activity',
} as const

/**
 * Admin audit endpoints
 */
export const ADMIN_AUDIT_ENDPOINTS = {
  LOGS: '/admin/audit-logs',
} as const

/**
 * Admin dashboard endpoints
 */
export const ADMIN_DASHBOARD_ENDPOINTS = {
  STATS: '/admin/dashboard',
} as const

/**
 * Admin featured vehicle endpoints
 */
export const ADMIN_FEATURED_VEHICLE_ENDPOINTS = {
  LIST: '/admin/featured-vehicles',
  CREATE: '/admin/featured-vehicles/create',
  UPDATE: (id: number | string) => `/admin/featured-vehicles/update/${id}`,
  DELETE: (id: number | string) => `/admin/featured-vehicles/delete/${id}`,
} as const

/**
 * Admin constants endpoints
 */
export const ADMIN_CONSTANTS_ENDPOINTS = {
  GET_ALL: '/admin/constants',
  BRANDS: {
    LIST: '/admin/brands',
    SHOW: (id: number | string) => `/admin/brands/show/${id}`,
    CREATE: '/admin/brands/create',
    UPDATE: (id: number | string) => `/admin/brands/update/${id}`,
    DELETE: (id: number | string) => `/admin/brands/delete/${id}`,
  },
  MODEL_YEARS: {
    LIST: '/admin/model-years',
    SHOW: (id: number | string) => `/admin/model-years/show/${id}`,
    CREATE: '/admin/model-years/create',
    UPDATE: (id: number | string) => `/admin/model-years/update/${id}`,
    DELETE: (id: number | string) => `/admin/model-years/delete/${id}`,
  },
  FUEL_TYPES: {
    LIST: '/admin/fuel-types',
    SHOW: (id: number | string) => `/admin/fuel-types/show/${id}`,
    CREATE: '/admin/fuel-types/create',
    UPDATE: (id: number | string) => `/admin/fuel-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/fuel-types/delete/${id}`,
  },
  GEAR_TYPES: {
    LIST: '/admin/gear-types',
    SHOW: (id: number | string) => `/admin/gear-types/show/${id}`,
    CREATE: '/admin/gear-types/create',
    UPDATE: (id: number | string) => `/admin/gear-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/gear-types/delete/${id}`,
  },
  LISTING_TYPES: {
    LIST: '/admin/listing-types',
    SHOW: (id: number | string) => `/admin/listing-types/show/${id}`,
    CREATE: '/admin/listing-types/create',
    UPDATE: (id: number | string) => `/admin/listing-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/listing-types/delete/${id}`,
  },
  BODY_TYPES: {
    LIST: '/admin/body-types',
    SHOW: (id: number | string) => `/admin/body-types/show/${id}`,
    CREATE: '/admin/body-types/create',
    UPDATE: (id: number | string) => `/admin/body-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/body-types/delete/${id}`,
  },
  COLORS: {
    LIST: '/admin/colors',
    SHOW: (id: number | string) => `/admin/colors/show/${id}`,
    CREATE: '/admin/colors/create',
    UPDATE: (id: number | string) => `/admin/colors/update/${id}`,
    DELETE: (id: number | string) => `/admin/colors/delete/${id}`,
  },
  VARIANTS: {
    LIST: '/admin/variants',
    SHOW: (id: number | string) => `/admin/variants/show/${id}`,
    CREATE: '/admin/variants/create',
    UPDATE: (id: number | string) => `/admin/variants/update/${id}`,
    DELETE: (id: number | string) => `/admin/variants/delete/${id}`,
  },
  TYPES: {
    LIST: '/admin/types',
    SHOW: (id: number | string) => `/admin/types/show/${id}`,
    CREATE: '/admin/types/create',
    UPDATE: (id: number | string) => `/admin/types/update/${id}`,
    DELETE: (id: number | string) => `/admin/types/delete/${id}`,
  },
  CONDITIONS: {
    LIST: '/admin/conditions',
    SHOW: (id: number | string) => `/admin/conditions/show/${id}`,
    CREATE: '/admin/conditions/create',
    UPDATE: (id: number | string) => `/admin/conditions/update/${id}`,
    DELETE: (id: number | string) => `/admin/conditions/delete/${id}`,
  },
  SALES_TYPES: {
    LIST: '/admin/sales-types',
    SHOW: (id: number | string) => `/admin/sales-types/show/${id}`,
    CREATE: '/admin/sales-types/create',
    UPDATE: (id: number | string) => `/admin/sales-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/sales-types/delete/${id}`,
  },
  PRICE_TYPES: {
    LIST: '/admin/price-types',
    SHOW: (id: number | string) => `/admin/price-types/show/${id}`,
    CREATE: '/admin/price-types/create',
    UPDATE: (id: number | string) => `/admin/price-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/price-types/delete/${id}`,
  },
  EURONORMS: {
    LIST: '/admin/euronorms',
    SHOW: (id: number | string) => `/admin/euronorms/show/${id}`,
    CREATE: '/admin/euronorms/create',
    UPDATE: (id: number | string) => `/admin/euronorms/update/${id}`,
    DELETE: (id: number | string) => `/admin/euronorms/delete/${id}`,
  },
  VEHICLE_MODELS: {
    LIST: '/admin/vehicle-models',
    SHOW: (id: number | string) => `/admin/vehicle-models/show/${id}`,
    CREATE: '/admin/vehicle-models/create',
    UPDATE: (id: number | string) => `/admin/vehicle-models/update/${id}`,
    DELETE: (id: number | string) => `/admin/vehicle-models/delete/${id}`,
  },
  VEHICLE_USES: {
    LIST: '/admin/vehicle-uses',
    SHOW: (id: number | string) => `/admin/vehicle-uses/show/${id}`,
    CREATE: '/admin/vehicle-uses/create',
    UPDATE: (id: number | string) => `/admin/vehicle-uses/update/${id}`,
    DELETE: (id: number | string) => `/admin/vehicle-uses/delete/${id}`,
  },
  VEHICLE_LIST_STATUSES: {
    LIST: '/admin/vehicle-list-statuses',
    SHOW: (id: number | string) => `/admin/vehicle-list-statuses/show/${id}`,
    CREATE: '/admin/vehicle-list-statuses/create',
    UPDATE: (id: number | string) => `/admin/vehicle-list-statuses/update/${id}`,
    DELETE: (id: number | string) => `/admin/vehicle-list-statuses/delete/${id}`,
  },
  EQUIPMENT_TYPES: {
    LIST: '/admin/equipment-types',
    SHOW: (id: number | string) => `/admin/equipment-types/show/${id}`,
    CREATE: '/admin/equipment-types/create',
    UPDATE: (id: number | string) => `/admin/equipment-types/update/${id}`,
    DELETE: (id: number | string) => `/admin/equipment-types/delete/${id}`,
  },
  EQUIPMENTS: {
    LIST: '/admin/equipments',
    SHOW: (id: number | string) => `/admin/equipments/show/${id}`,
    CREATE: '/admin/equipments/create',
    UPDATE: (id: number | string) => `/admin/equipments/update/${id}`,
    DELETE: (id: number | string) => `/admin/equipments/delete/${id}`,
  },
} as const

/**
 * Nummerplade proxy endpoints
 */
export const NUMMERPLADE_ENDPOINTS = {
  VEHICLE_BY_REGISTRATION: '/nummerplade/vehicle-by-registration',
  VEHICLE_BY_VIN: '/nummerplade/vehicle-by-vin',
  REFERENCE_BODY_TYPES: '/nummerplade/reference/body-types',
  REFERENCE_COLORS: '/nummerplade/reference/colors',
  REFERENCE_FUEL_TYPES: '/nummerplade/reference/fuel-types',
  REFERENCE_EQUIPMENT: '/nummerplade/reference/equipment',
  INSPECTIONS: (vehicleId: number | string) => `/nummerplade/inspections/${vehicleId}`,
  DMR: (vehicleId: number | string) => `/nummerplade/dmr/${vehicleId}`,
  DEBT: (vehicleId: number | string) => `/nummerplade/debt/${vehicleId}`,
  TINGLYSNING: (vin: string) => `/nummerplade/tinglysning/${vin}`,
  EMISSIONS: (input: string) => `/nummerplade/emissions/${input}`,
  EVALUATIONS: (input: string) => `/nummerplade/evaluations/${input}`,
} as const

