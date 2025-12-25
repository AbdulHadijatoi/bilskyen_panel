<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          class="mb-2"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h5 font-weight-bold mb-1">Vehicle Details</h2>
        <p class="text-body-2 text-medium-emphasis">
          View vehicle information and history.
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal">
        {{ error }}
      </v-alert>
    </div>

    <div v-else-if="vehicle" class="d-flex flex-column gap-4">
      <v-card variant="outlined">
        <v-card-title>Vehicle Information</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Title</div>
                <div class="font-weight-medium">{{ vehicle.title || 'N/A' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Registration</div>
                <div class="font-weight-medium">{{ vehicle.registration || 'N/A' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Price</div>
                <div class="font-weight-medium">{{ formatPrice(vehicle.price) }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Status</div>
                <v-chip
                  :color="getStatusColor(vehicle.status)"
                  size="small"
                  variant="flat"
                >
                  {{ vehicle.status || 'N/A' }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title>History</v-card-title>
        <v-card-text>
          <div v-if="loadingHistory" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="history.length === 0" class="text-center text-medium-emphasis py-4">
            No history available
          </div>
          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="item in history"
              :key="item.id"
              variant="outlined"
            >
              <v-card-text>
                <div class="text-caption text-medium-emphasis">{{ formatDate(item.changed_at) }}</div>
                <div>{{ item.action || 'Change' }}</div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVehicle, getVehicleHistory } from '@/api/admin.api'
import type { VehicleModel } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingHistory = ref(false)
const error = ref<string | null>(null)
const vehicle = ref<VehicleModel | null>(null)
const history = ref<any[]>([])

const loadVehicle = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loading.value = true
    error.value = null
    const loadedVehicle = await getVehicle(vehicleId)
    vehicle.value = loadedVehicle
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load vehicle'
  } finally {
    loading.value = false
  }
}

const loadHistory = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loadingHistory.value = true
    const historyData = await getVehicleHistory(vehicleId)
    history.value = historyData
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    loadingHistory.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    published: 'success',
    sold: 'info',
    archived: 'warning',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
}

const formatPrice = (price?: number) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
  }).format(price)
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  await Promise.all([loadVehicle(), loadHistory()])
})
</script>

