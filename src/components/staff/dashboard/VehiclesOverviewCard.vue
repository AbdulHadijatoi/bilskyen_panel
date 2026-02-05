<template>
  <div class="vehicles-overview-card" :style="{ width: '100%', border: 'none', backgroundColor: 'transparent', padding: 0, paddingTop: '1.5rem', minHeight: '200px', display: 'block' }">
    <div class="vehicles-overview-header" :style="{ padding: 0, marginBottom: '1.5rem' }">
      <div class="d-flex justify-space-between align-center mb-0">
        <div>
          <h3 class="text-xl font-semibold mb-0">Vehicles Overview</h3>
          <p class="text-sm mb-0" style="color: var(--muted-foreground);">Current stock and status</p>
        </div>
        <v-chip size="small" variant="outlined" prepend-icon="mdi-car" class="d-flex align-center" style="gap: 0.25rem;">
          {{ vehiclesOverview?.totalVehicles || 0 }} Total Vehicles
        </v-chip>
      </div>
    </div>

    <div class="vehicles-overview-content" :style="{ padding: 0, paddingTop: '1.5rem', display: 'block', visibility: 'visible', opacity: 1 }">
      <div class="space-y-6" :style="{ display: 'block', visibility: 'visible', opacity: 1 }">
        <!-- Vehicles Overview -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            Vehicles Overview
          </h4>
          <div class="d-grid" style="grid-template-columns: repeat(1, 1fr); gap: 1rem;">
            <div class="d-flex align-center justify-center rounded-lg border pa-4" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', gap: '0.75rem' }">
              <div
                class="d-flex align-center justify-center rounded-md"
                :style="{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  padding: '0.5rem',
                }"
              >
                <v-icon size="small">mdi-package-variant</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Available</p>
                <p class="text-lg font-semibold mb-0">{{ vehiclesOverview?.availableVehicles || 0 }}</p>
              </div>
            </div>
            <div class="d-flex align-center justify-center rounded-lg border pa-4" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', gap: '0.75rem' }">
              <div
                class="d-flex align-center justify-center rounded-md"
                :style="{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  padding: '0.5rem',
                }"
              >
                <v-icon size="small">mdi-clock-outline</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Pending</p>
                <p class="text-lg font-semibold mb-0">{{ vehiclesOverview?.pendingVehicles || 0 }}</p>
              </div>
            </div>
            <div class="d-flex align-center justify-center rounded-lg border pa-4" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', gap: '0.75rem' }">
              <div
                class="d-flex align-center justify-center rounded-md"
                :style="{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  padding: '0.5rem',
                }"
              >
                <v-icon size="small">mdi-wrench</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Need Work</p>
                <p class="text-lg font-semibold mb-0">{{ vehiclesOverview?.vehiclesNeedingWork || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Overview -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            Financial Overview
          </h4>
          <div class="d-grid" style="grid-template-columns: repeat(1, 1fr); gap: 1rem;">
            <div class="d-flex align-center justify-center rounded-lg border pa-4" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', gap: '0.75rem' }">
              <div
                class="d-flex align-center justify-center rounded-md"
                :style="{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  padding: '0.5rem',
                }"
              >
                <v-icon size="small">mdi-trending-up</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Total Inventory Value</p>
                <p class="text-lg font-semibold mb-0">{{ formatCurrency(vehiclesOverview?.totalInventoryValue || 0) }}</p>
              </div>
            </div>
            <div class="d-flex align-center justify-center rounded-lg border pa-4" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', gap: '0.75rem' }">
              <div
                class="d-flex align-center justify-center rounded-md"
                :style="{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  padding: '0.5rem',
                }"
              >
                <v-icon size="small">mdi-trending-up</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Average Vehicle Value</p>
                <p class="text-lg font-semibold mb-0">{{ formatCurrency(vehiclesOverview?.averageVehicleValue || 0) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_DEALER_BASE } from '@/constants/app'

interface VehiclesOverview {
  totalVehicles: number
  availableVehicles: number
  pendingVehicles: number
  vehiclesNeedingWork: number
  totalInventoryValue: number
  averageVehicleValue: number
}

const vehiclesOverview = ref<VehiclesOverview | null>(null)

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('da-DK', { maximumFractionDigits: 0 })} kr.`
}

const fetchVehiclesOverview = async () => {
  try {
    const response = await axios.get<VehiclesOverview>(
      `/api${API_DEALER_BASE}/get-vehicles-overview`
    )
    vehiclesOverview.value = response.data || null
  } catch (error) {
    console.error('Error fetching vehicles overview:', error)
    vehiclesOverview.value = null
  }
}

onMounted(() => {
  fetchVehiclesOverview()
})
</script>

<style scoped>
.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.d-grid {
  display: grid;
}

@media (min-width: 768px) {
  .d-grid[style*="grid-template-columns: repeat(1, 1fr)"] {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .d-grid[style*="Financial Overview"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>

