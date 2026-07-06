<template>
  <v-card variant="flat" elevation="1">
    <v-card-title class="d-flex align-center flex-wrap gap-2">
      <v-icon size="20" class="mr-1">mdi-chart-timeline-variant</v-icon>
      <span>{{ t('dealer.views.dashboard.fixImpactTitle') }}</span>
    </v-card-title>
    <v-card-subtitle>{{ t('dealer.views.dashboard.fixImpactSubtitle') }}</v-card-subtitle>
    <v-card-text>
      <div v-if="!items?.length" class="text-medium-emphasis">
        {{ t('dealer.views.dashboard.fixImpactEmpty') }}
      </div>

      <div
        v-for="item in items"
        :key="item.id"
        class="fix-impact-item mb-3 pb-3"
      >
        <div class="d-flex justify-space-between align-start gap-2 mb-1">
          <router-link
            :to="{ name: 'dealer.vehicles.detail', params: { id: item.vehicle_id } }"
            class="font-weight-medium text-decoration-none text-high-emphasis"
          >
            {{ item.title || `#${item.vehicle_id}` }}
          </router-link>
          <v-chip size="x-small" variant="tonal" :color="statusColor(item.status)">
            {{ statusLabel(item.status) }}
          </v-chip>
        </div>

        <p class="text-caption text-medium-emphasis mb-2">
          {{ fixTypeLabel(item.fix_type) }}
          <span v-if="item.fixed_at"> · {{ formatDate(item.fixed_at) }}</span>
        </p>

        <div v-if="item.status === 'measured'" class="d-flex flex-wrap gap-3">
          <div>
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.enquiryLift') }}</div>
            <div
              class="text-body-2 font-weight-bold"
              :class="liftClass(item.enquiry_lift)"
            >
              {{ formatLift(item.enquiry_lift) }}
            </div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.viewsLift') }}</div>
            <div class="text-body-2 font-weight-bold" :class="liftClass(item.views_lift)">
              {{ formatLift(item.views_lift) }}
            </div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.scoreLift') }}</div>
            <div class="text-body-2 font-weight-bold" :class="liftClass(item.score_lift)">
              {{ formatLift(item.score_lift) }}
            </div>
          </div>
        </div>

        <p v-else class="text-caption text-medium-emphasis mb-0">
          {{ t('dealer.views.dashboard.fixImpactPending', { days: item.days_until_measured ?? 7 }) }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ListingHealthFixImpactItem } from '@/api/dealer.api'
import { getIntlLocale } from '@/utils/defaultLocale'

defineProps<{
  items: ListingHealthFixImpactItem[] | null | undefined
}>()

const { t } = useI18n()

function statusColor(status?: string) {
  return status === 'measured' ? 'success' : 'warning'
}

function statusLabel(status?: string) {
  if (status === 'measured') return t('dealer.views.dashboard.fixImpactMeasured')
  return t('dealer.views.dashboard.fixImpactTracking')
}

function fixTypeLabel(fixType?: string) {
  if (fixType === 'price_apply') return t('dealer.views.dashboard.fixTypePriceApply')
  return fixType || t('dealer.views.dashboard.fixTypeGeneric')
}

function formatLift(value?: number | null) {
  if (value == null) return '—'
  if (value > 0) return `+${value}`
  return String(value)
}

function liftClass(value?: number | null) {
  if (value == null || value === 0) return ''
  return value > 0 ? 'text-success' : 'text-error'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(getIntlLocale())
}
</script>

<style scoped>
.fix-impact-item {
  border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}

.fix-impact-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
</style>
