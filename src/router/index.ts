import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useLoadingStore } from '@/stores/loading'
import { checkAuth } from '@/api/auth.api'
import { encryptUrlParam } from '@/utils/urlEncryption'
import { isAdmin, isDealer } from '@/utils/permissions'
import { hasFeature, getSubscriptionFeatures } from '@/utils/subscriptionFeatures'
import { loadSubscriptionFeatures } from '@/api/dealer.api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth/login',
      name: 'auth.login',
      component: () => import('@/views/auth/Login.vue'),
    },
    // Staff login route - hidden for now
    // {
    //   path: '/auth/staff-login',
    //   name: 'auth.staff-login',
    //   component: () => import('@/views/auth/StaffLogin.vue'),
    // },
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
          path: 'vehicles/:id',
          name: 'dealer.vehicles.detail',
          component: () => import('@/views/dealer/vehicles/VehicleDetail.vue'),
        },
        {
          path: 'leads',
          redirect: '/leads/overview',
        },
        {
          path: 'leads/overview',
          name: 'dealer.leads.overview',
          component: () => import('@/views/dealer/leads/LeadsOverview.vue'),
          meta: { requiresAuth: true, feature: 'lead_management' },
        },
        {
          path: 'leads/:id',
          name: 'dealer.leads.detail',
          component: () => import('@/views/dealer/leads/LeadDetail.vue'),
          meta: { requiresAuth: true, feature: 'lead_management' },
        },
        {
          path: 'enquiries',
          redirect: '/enquiries/overview',
        },
        {
          path: 'enquiries/overview',
          name: 'dealer.enquiries.overview',
          component: () => import('@/views/dealer/enquiries/EnquiriesOverview.vue'),
          meta: { requiresAuth: true, feature: 'enquiry_management' },
        },
        {
          path: 'enquiries/:id',
          name: 'dealer.enquiries.detail',
          component: () => import('@/views/dealer/enquiries/EnquiryDetail.vue'),
          meta: { requiresAuth: true, feature: 'enquiry_management' },
        },
        {
          path: 'staff',
          name: 'dealer.staff',
          component: () => import('@/views/dealer/staff/StaffManagement.vue'),
          meta: { requiresAuth: true, feature: 'staff_management' },
        },
        {
          path: 'subscription',
          name: 'dealer.subscription',
          component: () => import('@/views/dealer/subscription/Subscription.vue'),
        },
        {
          path: 'audit-logs',
          name: 'dealer.audit-logs',
          component: () => import('@/views/dealer/audit-logs/AuditLogs.vue'),
          meta: { requiresAuth: true, permission: 'dealer.audit.view', feature: 'audit_logs' },
        },
        {
          path: 'analytics',
          name: 'dealer.analytics',
          component: () => import('@/views/dealer/analytics/Analytics.vue'),
          meta: { requiresAuth: true, permission: 'dealer.analytics.view' },
        },
        {
          path: 'profile',
          name: 'dealer.profile',
          component: () => import('@/views/dealer/settings/ProfileSettings.vue'),
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
          path: 'subscriptions/:id',
          name: 'admin.subscriptions.detail',
          component: () => import('@/views/admin/subscriptions/SubscriptionDetail.vue'),
        },
        // Features routes hidden - managed through backend/migrations only
        // {
        //   path: 'features',
        //   name: 'admin.features',
        //   component: () => import('@/views/admin/features/FeaturesOverview.vue'),
        // },
        // {
        //   path: 'features/:id',
        //   name: 'admin.features.detail',
        //   component: () => import('@/views/admin/features/FeatureDetail.vue'),
        // },
        // Pages overview route removed - redirect to home page content management
        {
          path: 'pages',
          redirect: '/admin/pages/home-page-content',
        },
        {
          path: 'pages/:id',
          name: 'admin.pages.detail',
          component: () => import('@/views/admin/pages/PageDetail.vue'),
        },
        {
          path: 'pages/home-page-content',
          name: 'admin.home-page-content',
          component: () => import('@/views/admin/home-page-content/HomePageContentManagement.vue'),
        },
        {
          path: 'pages/about-page-content',
          name: 'admin.about-page-content',
          component: () => import('@/views/admin/about-page-content/AboutPageContentManagement.vue'),
        },
        {
          path: 'pages/contact-page-content',
          name: 'admin.contact-page-content',
          component: () => import('@/views/admin/contact-page-content/ContactPageContentManagement.vue'),
        },
        {
          path: 'pages/privacy-page-content',
          name: 'admin.privacy-page-content',
          component: () => import('@/views/admin/privacy-page-content/PrivacyPageContentManagement.vue'),
        },
        {
          path: 'pages/terms-page-content',
          name: 'admin.terms-page-content',
          component: () => import('@/views/admin/terms-page-content/TermsPageContentManagement.vue'),
        },
        {
          path: 'featured-vehicles',
          name: 'admin.featured-vehicles',
          component: () => import('@/views/admin/featured-vehicles/FeaturedVehicles.vue'),
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
        {
          path: 'permissions',
          name: 'admin.permissions',
          component: () => import('@/views/admin/permissions/PermissionsManagement.vue'),
        },
        {
          path: 'translations',
          name: 'admin.translations',
          component: () => import('@/views/admin/translations/TranslationsManagement.vue'),
        },
        {
          path: 'translations/import',
          name: 'admin.translations.import',
          component: () => import('@/views/admin/translations/TranslationsImport.vue'),
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

  try {
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
        return
        } else {
          // Check if route requires admin role
          if (to.meta.requiresAdmin && !isAdmin()) {
            // Non-admin trying to access admin route - redirect to dealer dashboard
            loadingStore.stopLoading()
            isNavigating = false
            next('/')
            return
          } else if (!to.meta.requiresAdmin && isAdmin() && to.path === '/') {
            // Admin trying to access dealer dashboard - redirect to admin dashboard
            loadingStore.stopLoading()
            isNavigating = false
            next('/admin')
            return
          } else {
            // Load subscription features if missing (for dealer/staff users)
            if (!isAdmin() && Object.keys(getSubscriptionFeatures()).length === 0) {
              try {
                await loadSubscriptionFeatures()
              } catch (error) {
                // Continue anyway - features might not be available
              }
            }
            
            // Check subscription feature if required (only for dealer routes)
            if (to.meta.feature && !isAdmin()) {
              if (!hasFeature(to.meta.feature as string)) {
                // Feature not available - redirect to subscription page or dashboard
                loadingStore.stopLoading()
                isNavigating = false
                const feature = to.meta.feature as string
                next(`/subscription?feature=${encodeURIComponent(feature)}`)
                return
              }
            }
            next()
            return
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
        return
      } else {
        next()
        return
      }
    } else {
      next()
      return
    }
  } catch (error) {
    // Handle any errors
    loadingStore.stopLoading()
    isNavigating = false
    next()
  }
})

router.afterEach(() => {
  const loadingStore = useLoadingStore()
  
  // Always stop loading after navigation completes
  if (isNavigating) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loadingStore.stopLoading()
      isNavigating = false
    }, 150)
  } else {
    // Ensure loading is stopped even if we weren't tracking navigation
    loadingStore.stopLoading()
  }
})

router.onError((error) => {
  const loadingStore = useLoadingStore()
  loadingStore.stopLoading()
  isNavigating = false
  console.error('Router error:', error)
})

export default router
