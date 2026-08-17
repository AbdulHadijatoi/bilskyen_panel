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
  STOP_IMPERSONATION: '/auth/stop-impersonation',
  REVOKE_SESSION: '/auth/revoke-session',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forget-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const

/**
 * Public lookup search (DMR brands / models / variants; no row limit on server)
 */
export const LOOKUP_SEARCH_ENDPOINTS = {
  BRANDS: '/brands',
  MODELS: '/models',
  VARIANTS: '/variants',
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
  LISTING_HEALTH: (id: number | string) => `/dealer/vehicles/${id}/listing-health`,
  CREATE: '/dealer/vehicles',
  DRAFT: '/dealer/vehicles/draft',
  UPDATE: (id: number | string) => `/dealer/vehicles/update/${id}`,
  DELETE: (id: number | string) => `/dealer/vehicles/delete/${id}`,
  BULK_DELETE: '/dealer/vehicles/bulk-delete',
  UPLOAD_IMAGES: (id: number | string) => `/dealer/vehicles/${id}/images`,
  DELETE_IMAGE: (vehicleId: number | string, imageId: number | string) =>
    `/dealer/vehicles/${vehicleId}/images/${imageId}`,
  UPDATE_STATUS: (id: number | string) => `/dealer/vehicles/update-status/${id}`,
  RENEW_LISTING: (id: number | string) => `/dealer/vehicles/renew-listing/${id}`,
  UPLOAD_3D_VIEW: (id: number | string) => `/dealer/vehicles/${id}/3d-view`,
  DELETE_3D_VIEW: (id: number | string) => `/dealer/vehicles/${id}/3d-view`,
  UPDATE_EQUIPMENT: (id: number | string) => `/dealer/vehicles/update-equipment/${id}`,
  UPDATE_PRICE: (id: number | string) => `/dealer/vehicles/${id}/price`,
  APPLY_SUGGESTED_PRICE: (id: number | string) => `/dealer/vehicles/${id}/apply-suggested-price`,
  BOOST_LISTING: (id: number | string) => `/dealer/vehicles/${id}/boost`,
  LOOKUP_BY_REGISTRATION: '/dealer/vehicles/lookup-by-registration',
  IMPORT_TEMPLATE: '/dealer/vehicles/import/template',
  IMPORT_SAMPLE: '/dealer/vehicles/import/sample',
  IMPORT: '/dealer/vehicles/import',
  IMPORT_BATCHES: '/dealer/vehicles/import/batches',
  IMPORT_BATCH: (id: number | string) => `/dealer/vehicles/import/batches/${id}`,
  EXPORT: '/dealer/vehicles/export',
  REORDER_IMAGES: (id: number | string) => `/dealer/vehicles/${id}/images/reorder`,
  UPDATE_VIDEO: (id: number | string) => `/dealer/vehicles/${id}/video`,
} as const

export const DEALER_FEED_ENDPOINTS = {
  TOKENS: '/dealer/feeds/tokens',
  TOKEN: (id: number | string) => `/dealer/feeds/tokens/${id}`,
} as const

export const DEALER_SYNDICATION_ENDPOINTS = {
  INDEX: '/dealer/syndication',
  SYNC: '/dealer/syndication/sync',
  META_PREVIEW: (id: number | string) => `/dealer/syndication/meta-preview/${id}`,
  META_FEED_URL: '/dealer/syndication/meta-feed-url',
} as const

export const DEALER_TRADE_IN_ENDPOINTS = {
  LIST: '/dealer/trade-in',
  UPDATE: (id: number | string) => `/dealer/trade-in/${id}`,
} as const

export const DEALER_BRANDING_ENDPOINTS = {
  SHOW: '/dealer/branding',
  UPDATE: '/dealer/branding',
  DOMAINS: '/dealer/branding/domains',
  VERIFY_DOMAIN: (id: number | string) => `/dealer/branding/domains/${id}/verify`,
  DELETE_DOMAIN: (id: number | string) => `/dealer/branding/domains/${id}`,
  AUDIT_LINK: '/dealer/branding/audit-link',
  REVIEW_SUMMARY: '/dealer/branding/review-summary',
} as const

export const DEALER_DMS_ENDPOINTS = {
  INDEX: '/dealer/dms',
  API_KEYS: '/dealer/dms/api-keys',
  API_KEY: (id: number | string) => `/dealer/dms/api-keys/${id}`,
  WEBHOOKS: '/dealer/dms/webhooks',
  WEBHOOK: (id: number | string) => `/dealer/dms/webhooks/${id}`,
} as const

export const DEALER_BULK_PRICE_ENDPOINTS = {
  UPDATE: '/dealer/vehicles/bulk-price-update',
} as const

export const DEALER_MARKETING_ENDPOINTS = {
  CAMPAIGNS: '/dealer/marketing/campaigns',
  CAMPAIGN: (id: number | string) => `/dealer/marketing/campaigns/${id}`,
  SEND_CAMPAIGN: (id: number | string) => `/dealer/marketing/campaigns/${id}/send`,
} as const

export const DEALER_DEAL_QUOTE_ENDPOINTS = {
  LIST: (leadId: number | string) => `/dealer/leads/${leadId}/deal-quotes`,
  CREATE: (leadId: number | string) => `/dealer/leads/${leadId}/deal-quotes`,
  UPDATE: (leadId: number | string, id: number | string) => `/dealer/leads/${leadId}/deal-quotes/${id}`,
  SEND: (leadId: number | string, id: number | string) => `/dealer/leads/${leadId}/deal-quotes/${id}/send`,
  DELETE: (leadId: number | string, id: number | string) => `/dealer/leads/${leadId}/deal-quotes/${id}`,
} as const

export const DEALER_COMPLIANCE_ENDPOINTS = {
  LEAD_PII_EXPORT: '/dealer/compliance/lead-pii-export',
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

export const DEALER_LEAD_CRM_ENDPOINTS = {
  LOST_REASONS: '/dealer/leads/crm/lost-reasons',
  ACTIVITIES: (leadId: number | string) => `/dealer/leads/crm/${leadId}/activities`,
  NOTES: (leadId: number | string) => `/dealer/leads/crm/${leadId}/notes`,
  TASKS: (leadId: number | string) => `/dealer/leads/crm/${leadId}/tasks`,
  TASK: (leadId: number | string, taskId: number | string) => `/dealer/leads/crm/${leadId}/tasks/${taskId}`,
  REMINDERS: (leadId: number | string) => `/dealer/leads/crm/${leadId}/reminders`,
  ONBOARDING_STATUS: '/dealer/onboarding',
  ONBOARDING_ADVANCE: '/dealer/onboarding/advance',
} as const

export const ADMIN_INTEGRATION_ENDPOINTS = {
  LIST: '/admin/integrations',
  UPDATE: '/admin/integrations',
  LOGS: '/admin/integrations/logs',
  TEST: '/admin/integrations/test',
} as const

export const ADMIN_SYNDICATION_ENDPOINTS = {
  PROVIDERS: '/admin/syndication/providers',
  LOGS: '/admin/syndication/logs',
  SYNC_DEALER: (dealerId: number | string) => `/admin/syndication/dealers/${dealerId}/sync`,
  SFTP_TEST: '/admin/syndication/sftp/test',
  SFTP_UPLOAD: '/admin/syndication/sftp/upload',
} as const

export const ADMIN_META_CATALOG_ENDPOINTS = {
  FEED_URL: '/admin/meta-catalog/feed-url',
  PREVIEW: (id: number | string) => `/admin/meta-catalog/preview/${id}`,
} as const

export const ADMIN_AI_ENDPOINTS = {
  USAGE: '/admin/ai/usage',
  PROMPT_TEMPLATES: '/admin/ai/prompt-templates',
  UPDATE_PROMPT_TEMPLATE: (id: number | string) => `/admin/ai/prompt-templates/${id}`,
  GENERATE: '/admin/ai/generate',
  TEST: '/admin/ai/test',
} as const

export const PUBLIC_AI_ENDPOINTS = {
  SELL_YOUR_CAR_GENERATE: '/sell-your-car/ai/generate',
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
  USAGE: '/dealer/subscription/usage',
  PLANS: '/dealer/plans',
  CREATE: '/dealer/subscription',
  PENDING_CHANGE_REQUEST: '/dealer/subscription/change-request',
  CANCEL_CHANGE_REQUEST: '/dealer/subscription/change-request/cancel',
} as const

/**
 * Dealer billing & payments endpoints
 */
export const DEALER_BILLING_ENDPOINTS = {
  CONFIG: '/dealer/billing/config',
  INVOICES: '/dealer/billing/invoices',
  INVOICE: (id: number | string) => `/dealer/billing/invoices/${id}`,
  CHECKOUT_INVOICE: (id: number | string) => `/dealer/billing/invoices/${id}/checkout`,
  SUBSCRIPTION_CHECKOUT: '/dealer/billing/subscription-checkout',
  PAYMENTS: '/dealer/billing/payments',
} as const

/**
 * Dealer AI assistant endpoints
 */
export const DEALER_AI_ENDPOINTS = {
  CONFIG: '/dealer/ai/config',
  GENERATE: '/dealer/ai/generate',
} as const

/**
 * Dealer dashboard endpoints
 */
export const DEALER_DASHBOARD_ENDPOINTS = {
  STATS: '/dealer/dashboard',
  LISTING_HEALTH_ATTENTION: '/dealer/listing-health-attention',
  MARKET_PULSE: '/dealer/market-pulse',
} as const

/**
 * Dealer notification endpoints
 */
export const DEALER_NOTIFICATION_ENDPOINTS = {
  LIST: '/dealer/notifications',
  COUNT: '/dealer/notifications/count',
  MARK_READ: '/dealer/notifications/mark-read',
} as const

/**
 * Dealer accounting endpoints
 */
export const DEALER_ACCOUNTING_ENDPOINTS = {
  FINANCIAL_OVERVIEW: '/dealer/accounting/get-financial-overview',
  FINANCIAL_OVERVIEW_CHART: '/dealer/accounting/get-financial-overview-chart',
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
  FUNNEL: '/dealer/analytics/funnel',
  STOCK: '/dealer/analytics/stock',
  ASSIGNEES: '/dealer/analytics/assignees',
  TRENDS: '/dealer/analytics/trends',
  CHANNELS: '/dealer/analytics/channels',
  EXPORT: '/dealer/analytics/export',
  EXPORT_PDF: '/dealer/analytics/export-pdf',
  MARKET_PULSE: '/dealer/analytics/market-pulse',
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
  IMPERSONATE: (id: number | string) => `/admin/dealers/${id}/impersonate`,
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
  PENDING_REVIEW: '/admin/vehicles/pending-review',
  APPROVE_PENDING: (id: number | string) => `/admin/vehicles/approve-pending/${id}`,
  REJECT_PENDING: (id: number | string) => `/admin/vehicles/reject-pending/${id}`,
  RENEW_LISTING: (id: number | string) => `/admin/vehicles/renew-listing/${id}`,
  LISTING_LIFECYCLE: (id: number | string) => `/admin/vehicles/listing-lifecycle/${id}`,
  UPDATE_IMAGES: (id: number | string) => `/admin/vehicles/update-images/${id}`,
  DELETE_IMAGE: (id: number | string) => `/admin/vehicles/delete-image/${id}`,
  UPDATE_EQUIPMENT: (id: number | string) => `/admin/vehicles/update-equipment/${id}`,
  DELETE: (id: number | string) => `/admin/vehicles/delete/${id}`,
  BULK_DELETE: '/admin/vehicles/bulk-delete',
} as const

/**
 * Admin lead endpoints
 */
export const ADMIN_LEAD_ENDPOINTS = {
  LIST: '/admin/leads',
  SHOW: (id: number | string) => `/admin/leads/show/${id}`,
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

export const ADMIN_SUBSCRIPTION_CHANGE_REQUEST_ENDPOINTS = {
  LIST: '/admin/subscription-change-requests',
  APPROVE: (id: number | string) => `/admin/subscription-change-requests/${id}/approve`,
  REJECT: (id: number | string) => `/admin/subscription-change-requests/${id}/reject`,
} as const

export const ADMIN_INVOICE_ENDPOINTS = {
  LIST: '/admin/invoices',
  SHOW: (id: number | string) => `/admin/invoices/${id}`,
  MARK_SENT: (id: number | string) => `/admin/invoices/${id}/mark-sent`,
  MARK_PAID: (id: number | string) => `/admin/invoices/${id}/mark-paid`,
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
 * Admin login page content endpoints (auth layout sidebar testimonial)
 */
export const ADMIN_LOGIN_PAGE_ENDPOINTS = {
  LIST: '/admin/login-page-content',
  UPDATE: (sectionKey: string) => `/admin/login-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/login-page-content/bulk-update',
} as const

export const ADMIN_PRICING_PAGE_ENDPOINTS = {
  LIST: '/admin/pricing-page-content',
  UPDATE: (sectionKey: string) => `/admin/pricing-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/pricing-page-content/bulk-update',
} as const

export const ADMIN_FAQ_PAGE_ENDPOINTS = {
  LIST: '/admin/faq-page-content',
  UPDATE: (sectionKey: string) => `/admin/faq-page-content/${sectionKey}`,
  BULK_UPDATE: '/admin/faq-page-content/bulk-update',
} as const

/**
 * Admin SEO pages endpoints
 */
export const ADMIN_SEO_PAGE_ENDPOINTS = {
  LIST: '/admin/seo-pages',
  PAGE_KEY_OPTIONS: '/admin/seo-pages/page-key-options',
  SHOW: (id: number | string) => `/admin/seo-pages/${id}`,
  CREATE: '/admin/seo-pages',
  UPDATE: (id: number | string) => `/admin/seo-pages/${id}`,
  DELETE: (id: number | string) => `/admin/seo-pages/${id}`,
} as const

export const ADMIN_CMS_POST_ENDPOINTS = {
  LIST: '/admin/cms/posts',
  SHOW: (id: number | string) => `/admin/cms/posts/${id}`,
  CREATE: '/admin/cms/posts',
  UPDATE: (id: number | string) => `/admin/cms/posts/${id}`,
  DELETE: (id: number | string) => `/admin/cms/posts/${id}`,
  CATEGORIES: '/admin/cms/posts/categories',
  RESTORE_VERSION: (id: number | string, versionId: number | string) => `/admin/cms/posts/${id}/versions/${versionId}/restore`,
} as const

export const ADMIN_LANDING_PAGE_ENDPOINTS = {
  LIST: '/admin/cms/landing-pages',
  SHOW: (id: number | string) => `/admin/cms/landing-pages/${id}`,
  CREATE: '/admin/cms/landing-pages',
  UPDATE: (id: number | string) => `/admin/cms/landing-pages/${id}`,
  DELETE: (id: number | string) => `/admin/cms/landing-pages/${id}`,
  RESTORE_VERSION: (id: number | string, versionId: number | string) => `/admin/cms/landing-pages/${id}/versions/${versionId}/restore`,
} as const

export const ADMIN_CMS_PREVIEW_ENDPOINTS = {
  LANDING: '/admin/cms/preview/landing',
  BLOG: '/admin/cms/preview/blog',
} as const

export const ADMIN_CMS_MEDIA_ENDPOINTS = {
  LIST: '/admin/cms/media',
  CREATE: '/admin/cms/media',
  UPDATE: (id: number | string) => `/admin/cms/media/${id}`,
  DELETE: (id: number | string) => `/admin/cms/media/${id}`,
} as const

export const ADMIN_SEO_REDIRECT_ENDPOINTS = {
  LIST: '/admin/seo/redirects',
  CREATE: '/admin/seo/redirects',
  UPDATE: (id: number | string) => `/admin/seo/redirects/${id}`,
  DELETE: (id: number | string) => `/admin/seo/redirects/${id}`,
} as const

export const ADMIN_SEO_TOOLS_ENDPOINTS = {
  ROBOTS: '/admin/seo/tools/robots',
  COOKIE_CONSENT: '/admin/seo/tools/cookie-consent',
  AUDIT: '/admin/seo/tools/audit',
  SCHEMA_PRESETS: '/admin/seo/tools/schema/presets',
  SCHEMA_BUILD: '/admin/seo/tools/schema/build',
} as const

/**
 * Public home page content endpoints
 */
export const PUBLIC_HOME_PAGE_ENDPOINTS = {
  GET: '/home-page-content',
} as const

/**
 * Public legal page content endpoints
 */
export const PUBLIC_PAGE_ENDPOINTS = {
  PRIVACY: '/privacy-policy',
  TERMS: '/terms-of-service',
  PLANS: '/public/plans',
  PRICING_FAQ: '/public/pricing-faq',
} as const

export const PUBLIC_PLATFORM_ENDPOINTS = {
  UI_SETTINGS: '/platform/ui-settings',
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
  FUNNEL: '/admin/analytics/funnel',
  COHORT: '/admin/analytics/cohort',
  INTEGRATIONS: '/admin/analytics/integrations',
  TRENDS: '/admin/analytics/trends',
  EXPORT: '/admin/analytics/export',
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
 * Locations dataset (admin) — city / postcode / coordinates for forms
 */
export const ADMIN_LOCATIONS_ENDPOINTS = {
  LIST: '/admin/locations',
  CREATE: '/admin/locations/create',
  UPDATE: (id: number | string) => `/admin/locations/update/${id}`,
  DELETE: (id: number | string) => `/admin/locations/delete/${id}`,
} as const

/**
 * Lead stages (admin) — fixed IDs, editable Danish names
 */
export const ADMIN_LEAD_STAGES_ENDPOINTS = {
  LIST: '/admin/lead-stages',
  UPDATE: (id: number | string) => `/admin/lead-stages/update/${id}`,
} as const

/**
 * Ownership tax rules endpoints (admin)
 */
export const ADMIN_OWNERSHIP_TAX_ENDPOINTS = {
  RULES: {
    LIST: '/admin/ownership-tax-rules',
    CREATE: '/admin/ownership-tax-rules/create',
    UPDATE: (id: number | string) => `/admin/ownership-tax-rules/update/${id}`,
    DELETE: (id: number | string) => `/admin/ownership-tax-rules/delete/${id}`,
  },
  DMR_DRIVE_ENERGIES: '/admin/dmr-drive-energies',
} as const

/**
 * Vehicle spec definitions catalog (admin)
 */
export const ADMIN_VEHICLE_SPEC_DEFINITIONS_ENDPOINTS = {
  LIST: '/admin/vehicle-spec-definitions',
  SHOW: (id: number | string) => `/admin/vehicle-spec-definitions/show/${id}`,
  CREATE: '/admin/vehicle-spec-definitions/create',
  UPDATE: (id: number | string) => `/admin/vehicle-spec-definitions/update/${id}`,
  DELETE: (id: number | string) => `/admin/vehicle-spec-definitions/delete/${id}`,
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
    FOR_LISTING_FILTERS: '/admin/vehicle-models/for-listing-filters',
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

