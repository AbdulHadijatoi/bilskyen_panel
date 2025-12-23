import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import { checkAuth } from '@/services/auth'
import { encryptUrlParam } from '@/utils/urlEncryption'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth/login',
      name: 'auth.login',
      component: () => import('@/views/auth/Login.vue'),
    },
    // Legacy login route for backward compatibility
    {
      path: '/login',
      redirect: '/auth/login',
    },
    {
      path: '/',
      component: () => import('@/components/dealer/DealerLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dealer.dashboard',
          component: () => import('@/views/dealer/Dashboard.vue'),
        },
        {
          path: 'vehicles',
          redirect: '/vehicles/overview',
        },
        {
          path: 'vehicles/overview',
          name: 'dealer.vehicles.overview',
          component: () => import('@/views/dealer/vehicles/VehiclesOverview.vue'),
        },
        {
          path: 'vehicles/add-vehicle',
          name: 'dealer.vehicles.add',
          component: () => import('@/views/dealer/vehicles/AddVehicle.vue'),
        },
        {
          path: 'purchases',
          redirect: '/purchases/overview',
        },
        {
          path: 'purchases/overview',
          name: 'dealer.purchases.overview',
          component: () => import('@/views/dealer/purchases/PurchasesOverview.vue'),
        },
        {
          path: 'purchases/add-purchase',
          name: 'dealer.purchases.add',
          component: () => import('@/views/dealer/purchases/AddPurchase.vue'),
        },
        {
          path: 'sales',
          redirect: '/sales/overview',
        },
        {
          path: 'sales/overview',
          name: 'dealer.sales.overview',
          component: () => import('@/views/dealer/sales/SalesOverview.vue'),
        },
        {
          path: 'sales/add-sale',
          name: 'dealer.sales.add',
          component: () => import('@/views/dealer/sales/AddSale.vue'),
        },
        {
          path: 'expenses',
          redirect: '/expenses/overview',
        },
        {
          path: 'expenses/overview',
          name: 'dealer.expenses.overview',
          component: () => import('@/views/dealer/expenses/ExpensesOverview.vue'),
        },
        {
          path: 'expenses/add-expense',
          name: 'dealer.expenses.add',
          component: () => import('@/views/dealer/expenses/AddExpense.vue'),
        },
        {
          path: 'contacts',
          redirect: '/contacts/directory',
        },
        {
          path: 'contacts/directory',
          name: 'dealer.contacts.directory',
          component: () => import('@/views/dealer/contacts/ContactsDirectory.vue'),
        },
        {
          path: 'contacts/add-contact',
          name: 'dealer.contacts.add',
          component: () => import('@/views/dealer/contacts/AddContact.vue'),
        },
        {
          path: 'enquiries',
          redirect: '/enquiries/overview',
        },
        {
          path: 'enquiries/overview',
          name: 'dealer.enquiries.overview',
          component: () => import('@/views/dealer/enquiries/EnquiriesOverview.vue'),
        },
        {
          path: 'enquiries/add-enquiry',
          name: 'dealer.enquiries.add',
          component: () => import('@/views/dealer/enquiries/AddEnquiry.vue'),
        },
        {
          path: 'accounting/transactions',
          name: 'dealer.accounting.transactions',
          component: () => import('@/views/dealer/accounting/Transactions.vue'),
        },
        {
          path: 'accounting/add-transaction',
          name: 'dealer.accounting.add-transaction',
          component: () => import('@/views/dealer/accounting/AddTransaction.vue'),
        },
        {
          path: 'accounting/financial-accounts',
          name: 'dealer.accounting.financial-accounts',
          component: () => import('@/views/dealer/accounting/FinancialAccounts.vue'),
        },
        {
          path: 'accounting/financial-accounts/add-financial-account',
          name: 'dealer.accounting.financial-accounts.add',
          component: () => import('@/views/dealer/accounting/AddFinancialAccount.vue'),
        },
        {
          path: 'accounting/financial-reports',
          name: 'dealer.accounting.financial-reports',
          component: () => import('@/views/dealer/accounting/FinancialReports.vue'),
        },
        {
          path: 'settings',
          redirect: '/settings/general',
        },
        {
          path: 'settings/general',
          name: 'dealer.settings.general',
          component: () => import('@/views/dealer/settings/GeneralSettings.vue'),
        },
        {
          path: 'settings/profile',
          name: 'dealer.settings.profile',
          component: () => import('@/views/dealer/settings/ProfileSettings.vue'),
        },
        {
          path: 'settings/sessions',
          name: 'dealer.settings.sessions',
          component: () => import('@/views/dealer/settings/SessionsSettings.vue'),
        },
        {
          path: 'settings/change-password',
          name: 'dealer.settings.change-password',
          component: () => import('@/views/dealer/settings/ChangePassword.vue'),
        },
        {
          path: 'settings/permissions',
          name: 'dealer.settings.permissions',
          component: () => import('@/views/dealer/settings/PermissionsManagement.vue'),
        },
        {
          path: 'notifications',
          name: 'dealer.notifications',
          component: () => import('@/views/dealer/Notifications.vue'),
        },
      ],
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/Privacy.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/Terms.vue'),
    },
  ],
})

// Track if we're navigating (to prevent showing loading on initial load)
let isNavigating = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const loadingStore = useLoadingStore()

  // Show loading indicator when navigating to a different route
  // Skip on initial load (when from.name is null)
  if (to.path !== from.path && from.name !== null) {
    isNavigating = true
    loadingStore.startLoading('Loading page...')
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    const isAuthenticated = await checkAuth()
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      // Encrypt the redirect parameter for security
      const encryptedRedirect = encryptUrlParam(to.fullPath)
      loadingStore.stopLoading()
      isNavigating = false
      next({ path: '/auth/login', query: { redirect: encryptedRedirect } })
    } else {
      next()
    }
  } else if (to.path === '/auth/login' || to.path === '/login') {
    // Prevent authenticated users from accessing login page
    // Check authentication status
    const isAuthenticated = await checkAuth()
    
    if (isAuthenticated) {
      // Redirect authenticated users away from login page
      loadingStore.stopLoading()
      isNavigating = false
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

router.afterEach(async () => {
  const loadingStore = useLoadingStore()
  
  // Only hide loading if we were actually navigating
  if (isNavigating) {
    // Wait a bit for the component to render and transition to complete
    // This ensures the loading indicator stays visible during the actual loading
    await new Promise(resolve => setTimeout(resolve, 150))
    loadingStore.stopLoading()
    isNavigating = false
  }
})

router.onError((error) => {
  const loadingStore = useLoadingStore()
  loadingStore.stopLoading()
  isNavigating = false
  console.error('Router error:', error)
})

export default router
