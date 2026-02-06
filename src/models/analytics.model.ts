/**
 * Analytics Data Models
 */

export interface AnalyticsOverview {
  vehicles: {
    total_listed: number
    active: number
    sold: number
    featured_count: number
  }
  dealers: {
    total: number
    active: number
  }
  sellers: {
    total: number
  }
  leads: {
    total: number
    by_type: {
      enquiry: number
      phone: number
      whatsapp: number
      email: number
      test_drive: number
      financing: number
    }
  }
  conversion_rate: number
}

export interface RevenueAnalytics {
  total_subscription_revenue: number
  monthly_recurring_revenue: number
  revenue_by_plan: Array<{
    plan_id: number
    plan_name: string
    active_subscriptions: number
    price: number
    billing_cycle: string
    revenue: number
  }>
  subscriptions: {
    active: number
    churned: number
  }
}

export interface DealerPerformance {
  top_by_listings: Array<{
    dealer_id: number
    cvr: string
    city: string
    listings_count: number
  }>
  top_by_leads: Array<{
    dealer_id: number
    cvr: string
    city: string
    leads_count: number
  }>
  top_by_sold: Array<{
    dealer_id: number
    cvr: string
    city: string
    sold_count: number
  }>
  average_response_times: Array<{
    dealer_id: number
    cvr: string
    average_response_time_hours: number
  }>
  activity_trend: Array<{
    date: string
    count: number
  }>
}

export interface VehicleAnalytics {
  by_category: Array<{
    category: string
    count: number
  }>
  by_fuel_type: Array<{
    fuel_type: string
    count: number
  }>
  by_price_range: Array<{
    range: string
    count: number
  }>
  average_days_to_sell: number
  most_viewed: Array<{
    vehicle_id: number
    title: string
    registration: string
    price: number
    view_count: number
  }>
}

export interface LeadAnalytics {
  over_time: Array<{
    date: string
    count: number
  }>
  by_source: Array<{
    source: string
    count: number
  }>
  by_vehicle: Array<{
    vehicle_id: number
    title: string
    registration: string
    lead_count: number
  }>
  conversion_rate: number
  unanswered_count: number
}

export interface UserActivityAnalytics {
  login_activity: Array<{
    date: string
    count: number
  }>
  listing_creation_trends: Array<{
    date: string
    count: number
  }>
  feature_usage: Array<{
    action: string
    count: number
  }>
}

// Dealer-specific analytics models

export interface DealerAnalyticsOverview {
  vehicles: {
    total_active: number
    sold: number
    reserved: number
    featured_count: number
    featured_limit: number
  }
  leads: {
    total: number
    by_type: {
      enquiry: number
      phone: number
      whatsapp: number
      email: number
      test_drive: number
      financing: number
    }
  }
  conversion_rate: number
}

export interface DealerLeadAnalytics {
  over_time: Array<{
    date: string
    count: number
  }>
  by_vehicle: Array<{
    vehicle_id: number
    title: string
    registration: string
    lead_count: number
  }>
  by_source: Array<{
    source: string
    count: number
  }>
  status_breakdown: Array<{
    stage: string
    count: number
  }>
  average_response_time_hours: number
}

export interface DealerVehicleAnalytics {
  most_viewed: Array<{
    vehicle_id: number
    title: string
    registration: string
    price: number
    view_count: number
  }>
  highest_leads: Array<{
    vehicle_id: number
    title: string
    registration: string
    price: number
    lead_count: number
  }>
  average_days_on_market: number
  price_change_history: Array<{
    vehicle_id: number
    title: string
    registration: string
    old_price: number
    new_price: number
    price_change: number
    changed_at: string
  }>
}

export interface MarketingAnalytics {
  featured_vs_non_featured: {
    featured_vehicles: number
    non_featured_vehicles: number
    featured_views: number
    non_featured_views: number
    featured_leads: number
    non_featured_leads: number
  }
}

export interface SubscriptionUsage {
  plan_name: string
  status: string
  renewal_date: string | null
  features: Array<{
    feature_key: string
    feature_name: string
    limit: number
    used: number
    usage_percentage: number
  }>
}
