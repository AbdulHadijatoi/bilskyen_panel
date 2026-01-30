import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useLoadingStore } from '@/stores/loading'
import { checkAuth } from '@/api/auth.api'
import { encryptUrlParam } from '@/utils/urlEncryption'
import { isAdmin, isDealer } from '@/utils/permissions'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth/login',
      name: 'auth.login',
      component: () => import('@/views/auth/Login.vue'),
    },
    {
      path: '/auth/register',
      name: 'auth.register',
      component: () => import('@/views/auth/Register.vue'),
    },
    {
      path: '/auth/forgot-password',
      name: 'auth.forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
    },
    {
      path: '/auth/reset-password',
      name: 'auth.reset-password',
      component: () => import('@/views/auth/ResetPassword.vue'),
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
          path: 'leads',
          redirect: '/leads/overview',
        },
        {
          path: 'leads/overview',
          name: 'dealer.leads.overview',
          component: () => import('@/views/dealer/leads/LeadsOverview.vue'),
        },
        {
          path: 'leads/:id',
          name: 'dealer.leads.detail',
          component: () => import('@/views/dealer/leads/LeadDetail.vue'),
        },
        {
          path: 'favorites',
          name: 'dealer.favorites',
          component: () => import('@/views/dealer/favorites/Favorites.vue'),
        },
        {
          path: 'saved-searches',
          name: 'dealer.saved-searches',
          component: () => import('@/views/dealer/saved-searches/SavedSearches.vue'),
        },
        {
          path: 'staff',
          name: 'dealer.staff',
          component: () => import('@/views/dealer/staff/StaffManagement.vue'),
        },
        {
          path: 'subscription',
          name: 'dealer.subscription',
          component: () => import('@/views/dealer/subscription/Subscription.vue'),
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
      ],
    },
        {
      path: '/admin',
      component: () => import('@/components/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin.dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'admin.users',
          component: () => import('@/views/admin/users/UsersOverview.vue'),
        },
        {
          path: 'users/:id',
          name: 'admin.users.detail',
          component: () => import('@/views/admin/users/UserDetail.vue'),
        },
        {
          path: 'dealers',
          name: 'admin.dealers',
          component: () => import('@/views/admin/dealers/DealersOverview.vue'),
        },
        {
          path: 'dealers/:id',
          name: 'admin.dealers.detail',
          component: () => import('@/views/admin/dealers/DealerDetail.vue'),
        },
        {
          path: 'vehicles',
          name: 'admin.vehicles',
          component: () => import('@/views/admin/vehicles/VehiclesOverview.vue'),
        },
        {
          path: 'vehicles/:id',
          name: 'admin.vehicles.detail',
          component: () => import('@/views/admin/vehicles/VehicleDetail.vue'),
        },
        {
          path: 'plans',
          name: 'admin.plans',
          component: () => import('@/views/admin/plans/PlansOverview.vue'),
        },
        {
          path: 'plans/:id',
          name: 'admin.plans.detail',
          component: () => import('@/views/admin/plans/PlanDetail.vue'),
        },
        {
          path: 'subscriptions',
          name: 'admin.subscriptions',
          component: () => import('@/views/admin/subscriptions/SubscriptionsOverview.vue'),
        },
        {
          path: 'features',
          name: 'admin.features',
          component: () => import('@/views/admin/features/FeaturesOverview.vue'),
        },
        {
          path: 'features/:id',
          name: 'admin.features.detail',
          component: () => import('@/views/admin/features/FeatureDetail.vue'),
        },
        {
          path: 'pages',
          name: 'admin.pages',
          component: () => import('@/views/admin/pages/PagesOverview.vue'),
        },
        {
          path: 'pages/:id',
          name: 'admin.pages.detail',
          component: () => import('@/views/admin/pages/PageDetail.vue'),
        },
        {
          path: 'blogs',
          name: 'admin.blogs',
          component: () => import('@/views/admin/blogs/BlogsOverview.vue'),
        },
        {
          path: 'blogs/:id',
          name: 'admin.blogs.detail',
          component: () => import('@/views/admin/blogs/BlogDetail.vue'),
        },
        {
          path: 'analytics',
          name: 'admin.analytics',
          component: () => import('@/views/admin/analytics/Analytics.vue'),
        },
        {
          path: 'audit-logs',
          name: 'admin.audit-logs',
          component: () => import('@/views/admin/audit-logs/AuditLogs.vue'),
        },
        {
          path: 'constants',
          name: 'admin.constants',
          component: () => import('@/views/admin/constants/ConstantsOverview.vue'),
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
      // Check if route requires admin role
      if (to.meta.requiresAdmin && !isAdmin()) {
        // Non-admin trying to access admin route - redirect to dealer dashboard
        loadingStore.stopLoading()
        isNavigating = false
        next('/')
      } else if (!to.meta.requiresAdmin && isAdmin() && to.path === '/') {
        // Admin trying to access dealer dashboard - redirect to admin dashboard
        loadingStore.stopLoading()
        isNavigating = false
        next('/admin')
      } else {
        next()
      }
    }
  } else if (
    to.path === '/auth/login' ||
    to.path === '/login' ||
    to.path === '/auth/register' ||
    to.path === '/auth/forgot-password' ||
    to.path === '/auth/reset-password'
  ) {
    // Prevent authenticated users from accessing auth pages
    // Check authentication status
    const isAuthenticated = await checkAuth()
    
    if (isAuthenticated) {
      // Redirect authenticated users to appropriate dashboard based on role
      loadingStore.stopLoading()
      isNavigating = false
      if (isAdmin()) {
        next('/admin')
      } else {
        next('/')
      }
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
