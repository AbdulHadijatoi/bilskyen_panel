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

export const DEALER_ROUTE_BASE = '/'

export const dealerSidebarSections: SidebarSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: DEALER_ROUTE_BASE,
        icon: 'mdi-view-dashboard',
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
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}vehicles/overview`,
          },
          {
            title: 'Add Vehicle',
            url: `${DEALER_ROUTE_BASE}vehicles/add-vehicle`,
          },
        ],
      },
      {
        title: 'Leads',
        url: `${DEALER_ROUTE_BASE}leads`,
        icon: 'mdi-account-group',
        items: [
          {
            title: 'Overview',
            url: `${DEALER_ROUTE_BASE}leads/overview`,
          },
        ],
      },
    ],
  },
  {
    title: 'User Features',
    items: [
      {
        title: 'Favorites',
        url: `${DEALER_ROUTE_BASE}favorites`,
        icon: 'mdi-heart',
      },
          {
        title: 'Saved Searches',
        url: `${DEALER_ROUTE_BASE}saved-searches`,
        icon: 'mdi-magnify',
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
      },
      {
        title: 'Subscription',
        url: `${DEALER_ROUTE_BASE}subscription`,
        icon: 'mdi-crown',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Settings',
        url: `${DEALER_ROUTE_BASE}settings`,
        icon: 'mdi-cog',
        items: [
          {
            title: 'General',
            url: `${DEALER_ROUTE_BASE}settings/general`,
          },
          {
            title: 'Profile',
            url: `${DEALER_ROUTE_BASE}settings/profile`,
          },
          {
            title: 'Sessions',
            url: `${DEALER_ROUTE_BASE}settings/sessions`,
          },
          {
            title: 'Change Password',
            url: `${DEALER_ROUTE_BASE}settings/change-password`,
          },
          {
            title: 'Permissions',
            url: `${DEALER_ROUTE_BASE}settings/permissions`,
          },
        ],
      },
    ],
  },
]

