<template>
  <div>
    <div class="mb-4">
      <h2 class="text-h5 font-weight-bold mb-1">Analytics</h2>
      <p class="text-body-2 text-medium-emphasis">
        View system-wide analytics and statistics.
      </p>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-title>Vehicle Analytics</v-card-title>
          <v-card-text>
            <div v-if="loadingVehicles" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
            <div v-else-if="vehicleAnalytics">
              <p class="text-medium-emphasis">Analytics data will be displayed here</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-title>Lead Analytics</v-card-title>
          <v-card-text>
            <div v-if="loadingLeads" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
            <div v-else-if="leadAnalytics">
              <p class="text-medium-emphasis">Analytics data will be displayed here</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-title>Subscription Analytics</v-card-title>
          <v-card-text>
            <div v-if="loadingSubscriptions" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
            <div v-else-if="subscriptionAnalytics">
              <p class="text-medium-emphasis">Analytics data will be displayed here</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getVehicleAnalytics, getLeadAnalytics, getSubscriptionAnalytics } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const loadingVehicles = ref(false)
const loadingLeads = ref(false)
const loadingSubscriptions = ref(false)
const vehicleAnalytics = ref<any>(null)
const leadAnalytics = ref<any>(null)
const subscriptionAnalytics = ref<any>(null)

const loadAnalytics = async () => {
  try {
    loadingVehicles.value = true
    loadingLeads.value = true
    loadingSubscriptions.value = true

    const [vehicles, leads, subscriptions] = await Promise.all([
      getVehicleAnalytics(),
      getLeadAnalytics(),
      getSubscriptionAnalytics(),
    ])

    vehicleAnalytics.value = vehicles
    leadAnalytics.value = leads
    subscriptionAnalytics.value = subscriptions
  } catch (err) {
    console.error('Failed to load analytics:', err)
  } finally {
    loadingVehicles.value = false
    loadingLeads.value = false
    loadingSubscriptions.value = false
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>

