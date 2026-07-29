<template>
  <PanelSidebar
    :sections="filteredSidebarSections"
    :section-title-keys="SECTION_TITLE_KEYS"
    :nav-title-keys="ADMIN_NAV_TITLE_KEYS"
    logo-to="/"
    :on-logout="logout"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { logout } from '@/api/auth.api'
import { adminSidebarSections } from '@/constants/admin'
import { hasPermission } from '@/utils/permissions'
import PanelSidebar from '@/components/panel/PanelSidebar.vue'

const { t } = useI18n()

const SECTION_TITLE_KEYS: Record<string, string> = {
  'User Management': 'admin.navSection.userManagement',
  'Content Management': 'admin.navSection.contentManagement',
  Subscriptions: 'admin.navSection.subscriptions',
  'Analytics & Logs': 'admin.navSection.analyticsLogs',
  Settings: 'admin.navSection.settings',
  Localization: 'admin.navSection.localization',
}

const ADMIN_NAV_TITLE_KEYS: Record<string, string> = {
  Dashboard: 'admin.nav.dashboard',
  Users: 'admin.nav.users',
  Overview: 'admin.nav.overview',
  Vehicles: 'admin.nav.vehicles',
  Leads: 'admin.nav.leads',
  Pages: 'admin.nav.pages',
  'Home Page Content': 'admin.nav.homePageContent',
  'About Page Content': 'admin.nav.aboutPageContent',
  'Contact Page Content': 'admin.nav.contactPageContent',
  'Privacy Page Content': 'admin.nav.privacyPageContent',
  'Terms Page Content': 'admin.nav.termsPageContent',
  'Login Page Content': 'admin.nav.loginPageContent',
  'Social Links': 'admin.nav.socialLinks',
  'Featured Vehicles': 'admin.nav.featuredVehicles',
  Plans: 'admin.nav.plans',
  Subscriptions: 'admin.nav.subscriptions',
  'Change requests': 'admin.nav.subscriptionChangeRequests',
  Analytics: 'admin.nav.analytics',
  'Audit Logs': 'admin.nav.auditLogs',
  Constants: 'admin.nav.constants',
  'Brands & models': 'admin.nav.brandsModels',
  Permissions: 'admin.nav.permissions',
  Translations: 'admin.nav.translations',
  'Manage Translations': 'admin.nav.manageTranslations',
  'Import Translations': 'admin.nav.importTranslations',
  Integrations: 'admin.nav.integrations',
  'AI Prompt Templates': 'admin.nav.aiPromptTemplates',
  Dealers: 'admin.nav.dealers',
  'Vehicle spec definitions': 'admin.nav.vehicleSpecDefinitions',
  'SEO Content': 'admin.nav.seoContent',
  'Blog Posts': 'admin.nav.blogPosts',
  'Landing Pages': 'admin.nav.landingPages',
  'Media Library': 'admin.nav.mediaLibrary',
  'SEO Redirects': 'admin.nav.seoRedirects',
  'SEO Tools': 'admin.nav.seoTools',
  Invoices: 'admin.nav.invoices',
  Features: 'admin.nav.features',
  'Ownership Tax Rules': 'admin.nav.ownershipTaxRules',
  'Manage Rules': 'admin.nav.manageRules',
  Locations: 'admin.nav.locations',
  'Lead Stages': 'admin.nav.leadStages',
}

const filteredSidebarSections = computed(() =>
  adminSidebarSections
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        if (!item.permission) {
          if (item.items?.length) {
            const visible = item.items.filter((sub) => !sub.permission || hasPermission(sub.permission))
            return visible.length > 0
          }
          return true
        }
        if (!hasPermission(item.permission)) return false
        if (item.items?.length) {
          const visible = item.items.filter((sub) => !sub.permission || hasPermission(sub.permission))
          return visible.length > 0
        }
        return true
      }).map((item) => {
        if (!item.items?.length) return item
        return {
          ...item,
          items: item.items.filter((sub) => !sub.permission || hasPermission(sub.permission)),
        }
      })

      return { ...section, items: filteredItems }
    })
    .filter((section) => section.items.length > 0),
)
</script>
