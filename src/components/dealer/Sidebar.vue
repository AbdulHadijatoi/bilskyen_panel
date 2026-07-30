<template>
  <PanelSidebar
    :sections="filteredSidebarSections"
    :section-title-keys="SECTION_TITLE_KEYS"
    :nav-title-keys="DEALER_NAV_TITLE_KEYS"
    logo-to="/"
    :on-logout="logout"
    bootstrap-user
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { logout } from '@/services/auth'
import { dealerSidebarSections } from '@/constants/dealer'
import { hasPermission } from '@/utils/permissions'
import { hasFeature } from '@/utils/subscriptionFeatures'
import PanelSidebar from '@/components/panel/PanelSidebar.vue'

const SECTION_TITLE_KEYS: Record<string, string> = {
  'Core Operations': 'navSection.coreOperations',
  Management: 'navSection.management',
}

const DEALER_NAV_TITLE_KEYS: Record<string, string> = {
  Dashboard: 'nav.dashboard',
  Vehicles: 'nav.vehicles',
  Overview: 'nav.overview',
  'Add Vehicle': 'nav.addVehicle',
  Leads: 'nav.leads',
  Enquiries: 'nav.enquiries',
  Staff: 'nav.staff',
  Subscription: 'nav.subscription',
  Billing: 'nav.billing',
  Analytics: 'nav.analytics',
  'Audit Logs': 'nav.auditLogs',
  'Feeds & Syndication': 'nav.feedsSyndication',
  'Meta Ads Guide': 'nav.metaAdsGuide',
  'Trade-In': 'nav.tradeIn',
  'Branding & DMS': 'nav.brandingDms',
  Marketing: 'nav.marketing',
}

const filteredSidebarSections = computed(() =>
  dealerSidebarSections
    .map((section) => {
      const filteredItems = section.items
        .map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null
          if (item.feature && !hasFeature(item.feature)) return null
          if (item.items?.length) {
            const visibleSubItems = item.items.filter((sub) => {
              if (sub.permission && !hasPermission(sub.permission)) return false
              if (sub.feature && !hasFeature(sub.feature)) return false
              return true
            })
            if (!visibleSubItems.length) return null
            return { ...item, items: visibleSubItems }
          }
          return item
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      return { ...section, items: filteredItems }
    })
    .filter((section) => section.items.length > 0),
)
</script>
