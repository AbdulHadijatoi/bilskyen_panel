export interface SidebarSectionItem {
  title: string
  url: string
  icon?: string
  badge?: string
  shortcut?: string[]
  permission?: string
  feature?: string // Subscription feature key (e.g., 'enquiry_management', 'lead_management')
  items?: {
    title: string
    url: string
    icon?: string
    badge?: string
    permission?: string
    feature?: string // Subscription feature key
  }[]
}

export interface SidebarSection {
  title?: string
  items: SidebarSectionItem[]
}

export const DEALER_ROUTE_BASE = '/'

export const dealerSidebarSections: SidebarSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: DEALER_ROUTE_BASE,
        icon: 'mdi-view-dashboard',
        permission: 'dealer.dashboard.view',
      },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      {
        title: 'Vehicles',
        url: `${DEALER_ROUTE_BASE}vehicles`,
        icon: 'mdi-car',
        permission: 'dealer.vehicles.view',
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}vehicles/overview`,
            permission: 'dealer.vehicles.view',
          },
          {
            title: 'Add Vehicle',
            url: `${DEALER_ROUTE_BASE}vehicles/add-vehicle`,
            permission: 'dealer.vehicles.create',
          },
        ],
      },
      {
        title: 'Leads',
        url: `${DEALER_ROUTE_BASE}leads`,
        icon: 'mdi-account-group',
        permission: 'dealer.leads.view',
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}leads/overview`,
            permission: 'dealer.leads.view',
          },
        ],
      },
      {
        title: 'Enquiries',
        url: `${DEALER_ROUTE_BASE}enquiries`,
        icon: 'mdi-email',
        permission: 'dealer.enquiries.view',
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}enquiries/overview`,
            permission: 'dealer.enquiries.view',
          },
        ],
      },
    ],
  },

  {
    title: 'Management',
    items: [
      {
        title: 'Staff',
        url: `${DEALER_ROUTE_BASE}staff`,
        icon: 'mdi-account-multiple',
        permission: 'dealer.staff.manage',
      },
      {
        title: 'Subscription',
        url: `${DEALER_ROUTE_BASE}subscription`,
        icon: 'mdi-crown',
        permission: 'dealer.subscription.manage',
      },
      {
        title: 'Billing',
        url: `${DEALER_ROUTE_BASE}billing`,
        icon: 'mdi-credit-card-outline',
        permission: 'dealer.subscription.manage',
      },
      {
        title: 'Audit Logs',
        url: `${DEALER_ROUTE_BASE}audit-logs`,
        icon: 'mdi-file-document-outline',
        permission: 'dealer.audit.view',
      },
      {
        title: 'Analytics',
        url: `${DEALER_ROUTE_BASE}analytics`,
        icon: 'mdi-chart-line',
        permission: 'dealer.analytics.view',
      },
      {
        title: 'Trade-In',
        url: `${DEALER_ROUTE_BASE}trade-in`,
        icon: 'mdi-car-arrow-right',
        permission: 'dealer.trade_in.manage',
      },
      {
        title: 'Feeds & Syndication',
        url: `${DEALER_ROUTE_BASE}feeds-syndication`,
        icon: 'mdi-rss',
        permission: 'dealer.syndication.manage',
      },
      {
        title: 'Branding & DMS',
        url: `${DEALER_ROUTE_BASE}branding`,
        icon: 'mdi-palette',
        permission: 'dealer.branding.manage',
      },
      {
        title: 'Marketing',
        url: `${DEALER_ROUTE_BASE}marketing`,
        icon: 'mdi-bullhorn',
        permission: 'dealer.branding.manage',
        feature: 'marketing_campaigns',
      },
    ],
  },
]

