export type FeatureTestGuide = {
  dealerPath: string
  locationKey: string
}

/**
 * Where admins can verify each subscription feature in the dealer panel.
 */
export const FEATURE_TEST_GUIDES: Record<string, FeatureTestGuide> = {
  max_listings: { dealerPath: '/vehicles/overview', locationKey: 'vehiclesOverview' },
  max_vehicle_images: { dealerPath: '/vehicles/add-vehicle', locationKey: 'addVehicle' },
  max_equipment_per_vehicle: { dealerPath: '/vehicles/add-vehicle', locationKey: 'addVehicle' },
  max_feature_listings: { dealerPath: '/vehicles/overview', locationKey: 'vehiclesOverview' },
  auto_feature_listings: { dealerPath: '/vehicles/overview', locationKey: 'vehiclesOverview' },
  listing_boost: { dealerPath: '/vehicles/overview', locationKey: 'vehicleDetail' },
  upload_3d_view: { dealerPath: '/vehicles/overview', locationKey: 'vehicleDetail' },
  bulk_price_update: { dealerPath: '/vehicles/overview', locationKey: 'vehiclesOverview' },
  branded_inventory_audit: { dealerPath: '/branding', locationKey: 'brandingDms' },
  listing_health_inbox: { dealerPath: '/', locationKey: 'dashboard' },
  listing_health_actions: { dealerPath: '/', locationKey: 'dashboard' },
  listing_health_ai_fixes: { dealerPath: '/', locationKey: 'dashboard' },
  listing_health_ai_briefing: { dealerPath: '/', locationKey: 'dashboard' },
  listing_health_equipment_gap: { dealerPath: '/', locationKey: 'dashboard' },
  listing_health_price_apply: { dealerPath: '/vehicles/overview', locationKey: 'vehicleDetail' },
  listing_health_before_after: { dealerPath: '/', locationKey: 'dashboard' },
  pricing_intelligence: { dealerPath: '/vehicles/overview', locationKey: 'vehicleDetail' },
  price_change_alerts: { dealerPath: '/vehicles/overview', locationKey: 'vehicleDetail' },
  market_pulse: { dealerPath: '/', locationKey: 'dashboard' },
  enquiry_management: { dealerPath: '/enquiries/overview', locationKey: 'enquiries' },
  enquiry_ai_replies: { dealerPath: '/enquiries/overview', locationKey: 'enquiries' },
  lead_management: { dealerPath: '/leads/overview', locationKey: 'leads' },
  lead_ai_summary: { dealerPath: '/leads/overview', locationKey: 'leads' },
  lead_auto_assign: { dealerPath: '/leads/overview', locationKey: 'leads' },
  lead_sla_alerts: { dealerPath: '/leads/overview', locationKey: 'leads' },
  lead_task_board: { dealerPath: '/leads/overview', locationKey: 'leads' },
  deal_builder: { dealerPath: '/leads/overview', locationKey: 'leads' },
  analytics: { dealerPath: '/analytics', locationKey: 'analytics' },
  advanced_analytics: { dealerPath: '/analytics', locationKey: 'analytics' },
  analytics_pdf_export: { dealerPath: '/analytics', locationKey: 'analytics' },
  analytics_listing_funnel: { dealerPath: '/analytics', locationKey: 'analytics' },
  analytics_dealer_benchmark: { dealerPath: '/analytics', locationKey: 'analytics' },
  ai_assistant: { dealerPath: '/', locationKey: 'dashboard' },
  ai_monthly_requests: { dealerPath: '/', locationKey: 'dashboard' },
  staff_management: { dealerPath: '/staff', locationKey: 'staff' },
  max_staff_users: { dealerPath: '/staff', locationKey: 'staff' },
  audit_logs: { dealerPath: '/audit-logs', locationKey: 'auditLogs' },
  api_access: { dealerPath: '/branding', locationKey: 'brandingDms' },
  priority_support: { dealerPath: '/subscription', locationKey: 'subscription' },
  dms_sync: { dealerPath: '/branding', locationKey: 'brandingDms' },
  finance_calculator_dealer: { dealerPath: '/vehicles/overview', locationKey: 'vehicleDetail' },
  review_management: { dealerPath: '/branding', locationKey: 'brandingDms' },
  dealer_trust_badge: { dealerPath: '/branding', locationKey: 'brandingDms' },
  premium_dealer_badge: { dealerPath: '/branding', locationKey: 'brandingDms' },
  inventory_feeds: { dealerPath: '/feeds-syndication', locationKey: 'feedsSyndication' },
  syndication: { dealerPath: '/meta-ads-guide', locationKey: 'metaAdsGuide' },
  syndication_channels: { dealerPath: '/feeds-syndication', locationKey: 'feedsSyndication' },
  marketing_campaigns: { dealerPath: '/marketing', locationKey: 'marketing' },
  retargeting: { dealerPath: '/meta-ads-guide', locationKey: 'metaAdsGuide' },
}

export function getFeatureTestGuide(featureKey: string): FeatureTestGuide | null {
  return FEATURE_TEST_GUIDES[featureKey] ?? null
}

export function getFeatureHelpI18nKey(featureKey: string): string {
  return `admin.views.plans.featureHelp.${featureKey}`
}

export function getFeatureVerifyI18nKey(featureKey: string): string {
  return `admin.views.plans.featureVerify.${featureKey}`
}
