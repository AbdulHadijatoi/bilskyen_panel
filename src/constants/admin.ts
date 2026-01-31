export interface SidebarSectionItem {
  title: string
  url: string
  icon?: string
  badge?: string
  shortcut?: string[]
  items?: {
    title: string
    url: string
    icon?: string
    badge?: string
  }[]
}

export interface SidebarSection {
  title?: string
  items: SidebarSectionItem[]
}

export const ADMIN_ROUTE_BASE = '/admin'

export const adminSidebarSections: SidebarSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: ADMIN_ROUTE_BASE,
        icon: 'mdi-view-dashboard',
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        title: 'Users',
        url: `${ADMIN_ROUTE_BASE}/users`,
        icon: 'mdi-account-group',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/users`,
          },
        ],
      },
    ],
  },
  {
    title: 'Content Management',
    items: [
      {
        title: 'Vehicles',
        url: `${ADMIN_ROUTE_BASE}/vehicles`,
        icon: 'mdi-car',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/vehicles`,
          },
        ],
      },
      {
        title: 'Pages',
        url: `${ADMIN_ROUTE_BASE}/pages`,
        icon: 'mdi-file-document',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/pages`,
          },
        ],
      },
      {
        title: 'Featured Vehicles',
        url: `${ADMIN_ROUTE_BASE}/featured-vehicles`,
        icon: 'mdi-star',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/featured-vehicles`,
          },
        ],
      },
    ],
  },
  {
    title: 'Subscriptions',
    items: [
      {
        title: 'Plans',
        url: `${ADMIN_ROUTE_BASE}/plans`,
        icon: 'mdi-package-variant',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/plans`,
          },
        ],
      },
      {
        title: 'Subscriptions',
        url: `${ADMIN_ROUTE_BASE}/subscriptions`,
        icon: 'mdi-crown',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/subscriptions`,
          },
        ],
      },
      {
        title: 'Features',
        url: `${ADMIN_ROUTE_BASE}/features`,
        icon: 'mdi-star',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/features`,
          },
        ],
      },
    ],
  },
  {
    title: 'Analytics & Logs',
    items: [
      {
        title: 'Analytics',
        url: `${ADMIN_ROUTE_BASE}/analytics`,
        icon: 'mdi-chart-line',
      },
      {
        title: 'Audit Logs',
        url: `${ADMIN_ROUTE_BASE}/audit-logs`,
        icon: 'mdi-file-document-outline',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Constants',
        url: `${ADMIN_ROUTE_BASE}/constants`,
        icon: 'mdi-cog',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/constants`,
          },
        ],
      },
    ],
  },
]

