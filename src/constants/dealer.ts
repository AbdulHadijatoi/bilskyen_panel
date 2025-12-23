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
        title: 'Purchases',
        url: `${DEALER_ROUTE_BASE}purchases`,
        icon: 'mdi-cart',
        items: [
          { title: 'Overview', url: `${DEALER_ROUTE_BASE}purchases/overview` },
          {
            title: 'Add Purchase',
            url: `${DEALER_ROUTE_BASE}purchases/add-purchase`,
          },
        ],
      },
      {
        title: 'Sales',
        url: `${DEALER_ROUTE_BASE}sales`,
        icon: 'mdi-cash',
        items: [
          { title: 'Overview', url: `${DEALER_ROUTE_BASE}sales/overview` },
          {
            title: 'Add Sale',
            url: `${DEALER_ROUTE_BASE}sales/add-sale`,
          },
        ],
      },
      {
        title: 'Expenses',
        url: `${DEALER_ROUTE_BASE}expenses`,
        icon: 'mdi-receipt-text',
        items: [
          { title: 'Overview', url: `${DEALER_ROUTE_BASE}expenses/overview` },
          {
            title: 'Add Expense',
            url: `${DEALER_ROUTE_BASE}expenses/add-expense`,
          },
        ],
      },
    ],
  },
  {
    title: 'Contact Management',
    items: [
      {
        title: 'Contacts',
        url: `${DEALER_ROUTE_BASE}contacts`,
        icon: 'mdi-account-group',
        items: [
          {
            title: 'Directory',
            url: `${DEALER_ROUTE_BASE}contacts/directory`,
          },
          {
            title: 'Add Contact',
            url: `${DEALER_ROUTE_BASE}contacts/add-contact`,
          },
        ],
      },
      {
        title: 'Enquiries',
        url: `${DEALER_ROUTE_BASE}enquiries`,
        icon: 'mdi-message-text',
        items: [
          { title: 'Overview', url: `${DEALER_ROUTE_BASE}enquiries/overview` },
          {
            title: 'Add Enquiry',
            url: `${DEALER_ROUTE_BASE}enquiries/add-enquiry`,
          },
        ],
      },
    ],
  },
  {
    title: 'Accounting & Finance',
    items: [
      {
        title: 'Transactions',
        url: `${DEALER_ROUTE_BASE}accounting/transactions`,
        icon: 'mdi-currency-usd',
        items: [
          {
            title: 'General Ledger Entries',
            url: `${DEALER_ROUTE_BASE}accounting/transactions`,
          },
          {
            title: 'Add Transaction',
            url: `${DEALER_ROUTE_BASE}accounting/add-transaction`,
          },
        ],
      },
      {
        title: 'Financial Accounts',
        url: `${DEALER_ROUTE_BASE}accounting/financial-accounts`,
        icon: 'mdi-book-open-page-variant',
        items: [
          {
            title: 'Chart of Accounts',
            url: `${DEALER_ROUTE_BASE}accounting/financial-accounts`,
          },
          {
            title: 'Add Financial Account',
            url: `${DEALER_ROUTE_BASE}accounting/financial-accounts/add-financial-account`,
          },
        ],
      },
      {
        title: 'Financial Reports',
        url: `${DEALER_ROUTE_BASE}accounting/financial-reports`,
        icon: 'mdi-file-document-multiple-outline',
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

