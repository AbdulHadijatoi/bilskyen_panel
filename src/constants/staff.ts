export interface SidebarSectionItem {
  title: string
  url: string
  icon?: string
  badge?: string
  shortcut?: string[]
  permission?: string
  items?: {
    title: string
    url: string
    icon?: string
    badge?: string
    permission?: string
  }[]
}

export interface SidebarSection {
  title?: string
  items: SidebarSectionItem[]
}

export const STAFF_ROUTE_BASE = '/staff'

export const staffSidebarSections: SidebarSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: STAFF_ROUTE_BASE,
        icon: 'mdi-view-dashboard',
        permission: 'staff.dashboard.view',
      },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      {
        title: 'Vehicles',
        url: `${STAFF_ROUTE_BASE}/vehicles`,
        icon: 'mdi-car',
        permission: 'staff.vehicles.view',
        items: [
          {
            title: 'Overview',
            url: `${STAFF_ROUTE_BASE}/vehicles/overview`,
            permission: 'staff.vehicles.view',
          },
          {
            title: 'Add Vehicle',
            url: `${STAFF_ROUTE_BASE}/vehicles/add-vehicle`,
            permission: 'staff.vehicles.create',
          },
        ],
      },
      {
        title: 'Leads',
        url: `${STAFF_ROUTE_BASE}/leads`,
        icon: 'mdi-account-group',
        permission: 'staff.leads.view',
        items: [
          {
            title: 'Overview',
            url: `${STAFF_ROUTE_BASE}/leads/overview`,
            permission: 'staff.leads.view',
          },
        ],
      },
      {
        title: 'Enquiries',
        url: `${STAFF_ROUTE_BASE}/enquiries`,
        icon: 'mdi-email',
        permission: 'staff.enquiries.view',
        items: [
          {
            title: 'Overview',
            url: `${STAFF_ROUTE_BASE}/enquiries/overview`,
            permission: 'staff.enquiries.view',
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
        url: `${STAFF_ROUTE_BASE}/staff`,
        icon: 'mdi-account-multiple',
        permission: 'staff.staff.manage',
      },
      {
        title: 'Subscription',
        url: `${STAFF_ROUTE_BASE}/subscription`,
        icon: 'mdi-crown',
        permission: 'staff.subscription.manage',
      },
      {
        title: 'Audit Logs',
        url: `${STAFF_ROUTE_BASE}/audit-logs`,
        icon: 'mdi-file-document-outline',
        permission: 'staff.audit.view',
      },
    ],
  },
]
