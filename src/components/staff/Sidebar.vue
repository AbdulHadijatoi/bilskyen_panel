<template>
  <PanelSidebar
    :sections="filteredSidebarSections"
    :section-title-keys="SECTION_TITLE_KEYS"
    :nav-title-keys="STAFF_NAV_TITLE_KEYS"
    :logo-to="STAFF_ROUTE_BASE"
    :on-logout="logout"
    bootstrap-user
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { logout } from '@/services/auth'
import { staffSidebarSections, STAFF_ROUTE_BASE } from '@/constants/staff'
import { hasPermission } from '@/utils/permissions'
import PanelSidebar from '@/components/panel/PanelSidebar.vue'

const SECTION_TITLE_KEYS: Record<string, string> = {
  'Core Operations': 'navSection.coreOperations',
  Management: 'navSection.management',
}

const STAFF_NAV_TITLE_KEYS: Record<string, string> = {
  Dashboard: 'nav.dashboard',
  Vehicles: 'nav.vehicles',
  Overview: 'nav.overview',
  'Add Vehicle': 'nav.addVehicle',
  Leads: 'nav.leads',
  Enquiries: 'nav.enquiries',
  Staff: 'nav.staff',
  Subscription: 'nav.subscription',
  Analytics: 'nav.analytics',
  'Audit Logs': 'nav.auditLogs',
  Favorites: 'nav.favorites',
  'Saved Searches': 'nav.savedSearches',
}

const filteredSidebarSections = computed(() =>
  staffSidebarSections
    .map((section) => {
      const filteredItems = section.items
        .map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null
          if (item.items?.length) {
            const visible = item.items.filter((sub) => !sub.permission || hasPermission(sub.permission))
            if (!visible.length) return null
            return { ...item, items: visible }
          }
          return item
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
      return { ...section, items: filteredItems }
    })
    .filter((section) => section.items.length > 0),
)
</script>
