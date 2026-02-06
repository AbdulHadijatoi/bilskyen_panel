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
        feature: 'lead_management',
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}leads/overview`,
            permission: 'dealer.leads.view',
            feature: 'lead_management',
          },
        ],
      },
      {
        title: 'Enquiries',
        url: `${DEALER_ROUTE_BASE}enquiries`,
        icon: 'mdi-email',
        feature: 'enquiry_management',
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}enquiries/overview`,
            feature: 'enquiry_management',
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
        feature: 'staff_management',
      },
      {
        title: 'Subscription',
        url: `${DEALER_ROUTE_BASE}subscription`,
        icon: 'mdi-crown',
        permission: 'dealer.subscription.manage',
      },
      {
        title: 'Audit Logs',
        url: `${DEALER_ROUTE_BASE}audit-logs`,
        icon: 'mdi-file-document-outline',
        permission: 'dealer.audit.view',
        feature: 'audit_logs',
      },
    ],
  },
]

