<template>
  <nav aria-label="breadcrumb" class="breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <router-link :to="base" class="breadcrumb-link">
          {{ label }}
        </router-link>
      </li>

      <li v-if="visibleSegments.length > 0" class="breadcrumb-separator" role="presentation" aria-hidden="true">
        <v-icon size="14">mdi-chevron-right</v-icon>
      </li>

      <template v-for="(segment, index) in visibleSegments" :key="segment">
        <li class="breadcrumb-item">
          <template v-if="index === visibleSegments.length - 1">
            <span class="breadcrumb-page" role="link" aria-disabled="true" aria-current="page">
              {{ getLabel(segment) }}
            </span>
          </template>
          <template v-else>
            <router-link :to="buildHref(segment)" class="breadcrumb-link" :title="getLabel(segment)">
              {{ getLabel(segment) }}
            </router-link>
          </template>
        </li>
        <li v-if="index < visibleSegments.length - 1" class="breadcrumb-separator" role="presentation" aria-hidden="true">
          <v-icon size="14">mdi-chevron-right</v-icon>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DEALER_ROUTE_BASE } from '@/constants/dealer'
import { ADMIN_ROUTE_BASE } from '@/constants/admin'

const route = useRoute()
const { t } = useI18n()

const isAdmin = computed(() => route.path.startsWith(ADMIN_ROUTE_BASE))

const BREADCRUMB_KEY_MAP: Record<string, string> = {
  'user-profile': 'breadcrumb.userProfile',
  settings: 'breadcrumb.settings',
  account: 'breadcrumb.account',
}

const ADMIN_BREADCRUMB_KEY_MAP: Record<string, string> = {
  users: 'admin.breadcrumb.users',
  vehicles: 'admin.breadcrumb.vehicles',
  plans: 'admin.breadcrumb.plans',
  subscriptions: 'admin.breadcrumb.subscriptions',
  pages: 'admin.breadcrumb.pages',
  'home-page-content': 'admin.breadcrumb.homePageContent',
  'about-page-content': 'admin.breadcrumb.aboutPageContent',
  'contact-page-content': 'admin.breadcrumb.contactPageContent',
  'privacy-page-content': 'admin.breadcrumb.privacyPageContent',
  'terms-page-content': 'admin.breadcrumb.termsPageContent',
  'featured-vehicles': 'admin.breadcrumb.featuredVehicles',
  analytics: 'admin.breadcrumb.analytics',
  'audit-logs': 'admin.breadcrumb.auditLogs',
  constants: 'admin.breadcrumb.constants',
  permissions: 'admin.breadcrumb.permissions',
  translations: 'admin.breadcrumb.translations',
  import: 'admin.breadcrumb.import',
}

const base = computed(() => (isAdmin.value ? ADMIN_ROUTE_BASE : DEALER_ROUTE_BASE))

const label = computed(() =>
  isAdmin.value ? t('admin.breadcrumb.dashboard') : t('breadcrumb.dashboard')
)

const visibleSegments = computed(() => {
  const path = route.path
  if (isAdmin.value) {
    const relativePath = path.replace(new RegExp(`^${ADMIN_ROUTE_BASE}/?`), '')
    return relativePath ? relativePath.split('/').filter(Boolean) : []
  }
  if (!path.startsWith(DEALER_ROUTE_BASE)) return []
  const relativePath = path.replace(DEALER_ROUTE_BASE, '').replace(/^\//, '')
  return relativePath ? relativePath.split('/').filter(Boolean) : []
})

const buildHref = (segment: string) => {
  const index = visibleSegments.value.indexOf(segment)
  const relative = visibleSegments.value.slice(0, index + 1)
  const basePath = base.value.replace(/\/$/, '')
  return basePath ? `${basePath}/${relative.join('/')}` : `/${relative.join('/')}`
}

const toTitleCase = (str: string) => {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getLabel = (segment: string) => {
  const keyMap = isAdmin.value ? ADMIN_BREADCRUMB_KEY_MAP : BREADCRUMB_KEY_MAP
  const key = keyMap[segment]
  return key ? t(key) : toTitleCase(segment)
}
</script>

<style scoped>
.breadcrumb {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.breadcrumb-list {
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  word-break: break-words;
  visibility: visible !important;
  opacity: 1 !important;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: inline-flex !important;
  align-items: center;
  gap: 0.375rem;
  visibility: visible !important;
  opacity: 1 !important;
}

.breadcrumb-link {
  color: var(--muted-foreground) !important;
  text-decoration: none;
  transition: color 0.2s;
  visibility: visible !important;
  opacity: 1 !important;
}

.breadcrumb-link:hover {
  color: var(--foreground) !important;
}

.breadcrumb-page {
  color: var(--foreground) !important;
  font-weight: 400;
  visibility: visible !important;
  opacity: 1 !important;
}

.breadcrumb-separator {
  display: flex !important;
  align-items: center;
  color: var(--muted-foreground);
  visibility: visible !important;
  opacity: 1 !important;
}

.breadcrumb-separator :deep(.v-icon) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  color: var(--muted-foreground) !important;
}

@media (min-width: 640px) {
  .breadcrumb-list {
    gap: 0.625rem;
  }
  
  .breadcrumb-item {
    gap: 0.625rem;
  }
}
</style>
