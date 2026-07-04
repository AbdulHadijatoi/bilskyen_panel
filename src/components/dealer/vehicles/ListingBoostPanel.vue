<template>
  <v-card variant="flat" elevation="1" class="listing-boost-panel">
    <v-card-title class="d-flex align-center flex-wrap gap-2">
      <v-icon size="20" class="mr-1">mdi-rocket-launch</v-icon>
      <span>{{ t('dealer.views.vehicleDetail.listingBoostTitle') }}</span>
    </v-card-title>
    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-3">
        {{ t('dealer.views.vehicleDetail.listingBoostSubtitle', { days: boostDays }) }}
      </p>

      <div v-if="status?.active" class="mb-3">
        <v-chip color="warning" variant="tonal" size="small">
          {{ t('dealer.views.vehicleDetail.listingBoostActive', {
            days: status.active.days_remaining ?? 0,
          }) }}
        </v-chip>
      </div>

      <div class="text-caption text-medium-emphasis mb-3">
        {{ t('dealer.views.vehicleDetail.listingBoostQuota', {
          active: meta?.active_count ?? 0,
          max: meta?.max_active ?? 5,
        }) }}
      </div>

      <v-btn
        v-if="meta?.can_boost"
        size="small"
        color="primary"
        variant="flat"
        :loading="boosting"
        @click="boostListing"
      >
        {{ t('dealer.views.vehicleDetail.boostListing') }}
      </v-btn>
      <p v-else-if="!status?.active" class="text-caption text-medium-emphasis mb-0">
        {{ boostBlockedReason }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { boostVehicleListing } from '@/api/dealer.api'

export interface ListingBoostMeta {
  active?: {
    expires_at?: string
    days_remaining?: number
  } | null
  can_boost?: boolean
  active_count?: number
  max_active?: number
}

const props = defineProps<{
  vehicleId: number | string
  meta: ListingBoostMeta | null
}>()

const emit = defineEmits<{
  boosted: [payload: ListingBoostMeta]
}>()

const { t } = useI18n()
const boosting = ref(false)
const boostDays = 7

const status = computed(() => props.meta)

const boostBlockedReason = computed(() => {
  if ((props.meta?.active_count ?? 0) >= (props.meta?.max_active ?? 5)) {
    return t('dealer.views.vehicleDetail.listingBoostLimitReached')
  }

  return t('dealer.views.vehicleDetail.listingBoostUnavailable')
})

async function boostListing() {
  try {
    boosting.value = true
    const result = await boostVehicleListing(props.vehicleId)
    emit('boosted', {
      active: result.boost,
      can_boost: false,
      active_count: result.activeCount,
      max_active: props.meta?.max_active ?? 5,
    })
  } finally {
    boosting.value = false
  }
}
</script>
