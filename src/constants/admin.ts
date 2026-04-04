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

export const ADMIN_ROUTE_BASE = '/admin'

export const adminSidebarSections: SidebarSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: ADMIN_ROUTE_BASE,
        icon: 'mdi-view-dashboard',
        permission: 'admin.dashboard.view',
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
        permission: 'admin.users.view',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/users`,
            permission: 'admin.users.view',
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
        permission: 'admin.vehicles.view',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/vehicles`,
            permission: 'admin.vehicles.view',
          },
        ],
      },
      {
        title: 'Vehicle spec definitions',
        url: `${ADMIN_ROUTE_BASE}/vehicle-spec-definitions`,
        icon: 'mdi-clipboard-list-outline',
        permission: 'admin.constants.view',
      },
      {
        title: 'Pages',
        url: `${ADMIN_ROUTE_BASE}/pages/home-page-content`,
        icon: 'mdi-file-document',
        permission: 'admin.pages.view',
        items: [
          {
            title: 'Home Page Content',
            url: `${ADMIN_ROUTE_BASE}/pages/home-page-content`,
            permission: 'admin.pages.update',
          },
          {
            title: 'About Page Content',
            url: `${ADMIN_ROUTE_BASE}/pages/about-page-content`,
            permission: 'admin.pages.update',
          },
          {
            title: 'Contact Page Content',
            url: `${ADMIN_ROUTE_BASE}/pages/contact-page-content`,
            permission: 'admin.pages.update',
          },
          {
            title: 'Privacy Page Content',
            url: `${ADMIN_ROUTE_BASE}/pages/privacy-page-content`,
            permission: 'admin.pages.update',
          },
          {
            title: 'Terms Page Content',
            url: `${ADMIN_ROUTE_BASE}/pages/terms-page-content`,
            permission: 'admin.pages.update',
          },
          {
            title: 'Login Page Content',
            url: `${ADMIN_ROUTE_BASE}/pages/login-page-content`,
            permission: 'admin.pages.update',
          },
          {
            title: 'SEO Content',
            url: `${ADMIN_ROUTE_BASE}/pages/seo-content`,
            permission: 'admin.pages.update',
          },
        ],
      },
      {
        title: 'Featured Vehicles',
        url: `${ADMIN_ROUTE_BASE}/featured-vehicles`,
        icon: 'mdi-star',
        permission: 'admin.featured-vehicles.view',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/featured-vehicles`,
            permission: 'admin.featured-vehicles.view',
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
        permission: 'admin.plans.view',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/plans`,
            permission: 'admin.plans.view',
          },
        ],
      },
      {
        title: 'Subscriptions',
        url: `${ADMIN_ROUTE_BASE}/subscriptions`,
        icon: 'mdi-crown',
        permission: 'admin.subscriptions.view',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/subscriptions`,
            permission: 'admin.subscriptions.view',
          },
          {
            title: 'Change requests',
            url: `${ADMIN_ROUTE_BASE}/subscription-change-requests`,
            permission: 'admin.subscription_change_requests.view',
          },
        ],
      },
      // Features menu item hidden - managed through backend/migrations only
      // {
      //   title: 'Features',
      //   url: `${ADMIN_ROUTE_BASE}/features`,
      //   icon: 'mdi-star',
      //   items: [
      //     {
      //       title: 'Overview',
      //       url: `${ADMIN_ROUTE_BASE}/features`,
      //     },
      //   ],
      // },
    ],
  },
  {
    title: 'Analytics & Logs',
    items: [
      {
        title: 'Analytics',
        url: `${ADMIN_ROUTE_BASE}/analytics`,
        icon: 'mdi-chart-line',
        permission: 'admin.analytics.view',
      },
      {
        title: 'Audit Logs',
        url: `${ADMIN_ROUTE_BASE}/audit-logs`,
        icon: 'mdi-file-document-outline',
        permission: 'admin.audit-logs.view',
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
        permission: 'admin.constants.view',
        items: [
          {
            title: 'Overview',
            url: `${ADMIN_ROUTE_BASE}/constants`,
            permission: 'admin.constants.view',
          },
        ],
      },
      {
        title: 'Brands & models',
        url: `${ADMIN_ROUTE_BASE}/brands-models-variants`,
        icon: 'mdi-car-info',
        permission: 'admin.constants.view',
      },
      {
        title: 'Ownership Tax Rules',
        url: `${ADMIN_ROUTE_BASE}/ownership-tax-rules`,
        icon: 'mdi-cash-multiple',
        permission: 'admin.constants.view',
        items: [
          {
            title: 'Manage Rules',
            url: `${ADMIN_ROUTE_BASE}/ownership-tax-rules`,
            permission: 'admin.constants.view',
          },
        ],
      },
      {
        title: 'Locations',
        url: `${ADMIN_ROUTE_BASE}/locations`,
        icon: 'mdi-map-marker-radius',
        permission: 'admin.constants.view',
      },
      {
        title: 'Permissions',
        url: `${ADMIN_ROUTE_BASE}/permissions`,
        icon: 'mdi-shield-lock',
        permission: 'admin.permissions.view',
      },
    ],
  },
  {
    title: 'Localization',
    items: [
      {
        title: 'Translations',
        url: `${ADMIN_ROUTE_BASE}/translations`,
        icon: 'mdi-translate',
        items: [
          {
            title: 'Manage Translations',
            url: `${ADMIN_ROUTE_BASE}/translations`,
          },
          {
            title: 'Import Translations',
            url: `${ADMIN_ROUTE_BASE}/translations/import`,
          },
        ],
      },
    ],
  },
]

