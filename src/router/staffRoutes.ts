import type { RouteRecordRaw } from 'vue-router'

export const staffRoutes: RouteRecordRaw = {
  path: '/staff',
  component: () => import('@/components/staff/StaffLayout.vue'),
  meta: { requiresAuth: true, requiresStaff: true },
  children: [
    {
      path: '',
      name: 'staff.dashboard',
      component: () => import('@/views/staff/Dashboard.vue'),
      meta: { requiresAuth: true, permission: 'staff.dashboard.view' },
    },
    { path: 'vehicles', redirect: '/staff/vehicles/overview' },
    {
      path: 'vehicles/overview',
      name: 'staff.vehicles.overview',
      component: () => import('@/views/staff/vehicles/VehiclesOverview.vue'),
      meta: { requiresAuth: true, permission: 'staff.vehicles.view' },
    },
    {
      path: 'vehicles/add-vehicle',
      name: 'staff.vehicles.add',
      component: () => import('@/views/staff/vehicles/AddVehicle.vue'),
      meta: { requiresAuth: true, permission: 'staff.vehicles.create' },
    },
    {
      path: 'vehicles/:id',
      name: 'staff.vehicles.detail',
      component: () => import('@/views/staff/vehicles/VehicleDetail.vue'),
      meta: { requiresAuth: true, permission: 'staff.vehicles.view' },
    },
    { path: 'leads', redirect: '/staff/leads/overview' },
    {
      path: 'leads/overview',
      name: 'staff.leads.overview',
      component: () => import('@/views/staff/leads/LeadsOverview.vue'),
      meta: { requiresAuth: true, permission: 'staff.leads.view', feature: 'lead_management' },
    },
    {
      path: 'leads/:id',
      name: 'staff.leads.detail',
      component: () => import('@/views/staff/leads/LeadDetail.vue'),
      meta: { requiresAuth: true, permission: 'staff.leads.view', feature: 'lead_management' },
    },
    { path: 'enquiries', redirect: '/staff/enquiries/overview' },
    {
      path: 'enquiries/overview',
      name: 'staff.enquiries.overview',
      component: () => import('@/views/staff/enquiries/EnquiriesOverview.vue'),
      meta: { requiresAuth: true, permission: 'staff.enquiries.view', feature: 'enquiry_management' },
    },
    {
      path: 'enquiries/:id',
      name: 'staff.enquiries.detail',
      component: () => import('@/views/staff/enquiries/EnquiryDetail.vue'),
      meta: { requiresAuth: true, permission: 'staff.enquiries.view', feature: 'enquiry_management' },
    },
    {
      path: 'subscription',
      name: 'staff.subscription',
      component: () => import('@/views/staff/subscription/Subscription.vue'),
      meta: { requiresAuth: true, permission: 'staff.subscription.view' },
    },
    {
      path: 'audit-logs',
      name: 'staff.audit-logs',
      component: () => import('@/views/staff/audit-logs/AuditLogs.vue'),
      meta: { requiresAuth: true, permission: 'staff.audit.view', feature: 'audit_logs' },
    },
    {
      path: 'profile',
      name: 'staff.profile',
      component: () => import('@/views/staff/settings/ProfileSettings.vue'),
    },
  ],
}
