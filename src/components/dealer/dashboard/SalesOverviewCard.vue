<template>
  <div class="sales-overview-card" :style="{ width: '100%', border: 'none', backgroundColor: 'transparent', padding: 0, paddingTop: '1.5rem', minHeight: '200px', display: 'block' }">
    <div class="sales-overview-header" :style="{ padding: 0, marginBottom: '1.5rem' }">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h3 class="text-xl font-semibold mb-0">Sales Overview</h3>
          <p class="text-sm mb-0" style="color: var(--muted-foreground);">Sales performance and revenue insights</p>
        </div>
        <v-chip size="small" variant="outlined" prepend-icon="mdi-trending-up" class="d-flex align-center" style="gap: 0.25rem;">
          {{ salesOverview?.totalSales || 0 }} Total Sales
        </v-chip>
      </div>
    </div>

    <div class="sales-overview-content" :style="{ padding: 0, paddingTop: '1.5rem', display: 'block', visibility: 'visible', opacity: 1 }">
      <div class="space-y-6" :style="{ display: 'block', visibility: 'visible', opacity: 1 }">
        <!-- Revenue Overview -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            Revenue Overview
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
                <v-icon size="small">mdi-currency-inr</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Total Revenue</p>
                <p class="text-lg font-semibold mb-0">{{ formatCurrency(salesOverview?.totalRevenue || 0) }}</p>
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
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Average Sale Value</p>
                <p class="text-lg font-semibold mb-0">{{ formatCurrency(salesOverview?.averageSaleValue || 0) }}</p>
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
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Avg Days to Sell</p>
                <p class="text-lg font-semibold mb-0">{{ salesOverview?.averageDaysToSell || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Performance -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            Sales Performance
          </h4>
          <div class="d-grid" style="grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesThisMonth || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">Sales This Month</p>
            </div>
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesThisQuarter || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">Sales This Quarter</p>
            </div>
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesLast7Days || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">Sales (7 days)</p>
            </div>
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesLast24Hours || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">Sales (24h)</p>
            </div>
          </div>
        </div>

        <!-- Top Performance -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            Top Performance
          </h4>
          <div class="d-flex align-center rounded-lg border pa-4" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', gap: '0.75rem' }">
            <div
              class="d-flex align-center justify-center rounded-md"
              :style="{
                backgroundColor: 'var(--muted)',
                color: 'var(--muted-foreground)',
                padding: '0.5rem',
              }"
            >
              <v-icon size="small">mdi-calendar</v-icon>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">Top Month</p>
              <p class="text-lg font-semibold mb-0">{{ salesOverview?.topSellingMonth || 'N/A' }}</p>
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
import { DEALER_ROUTE_BASE } from '@/constants/dealer'

interface SalesOverview {
  totalSales: number
  totalRevenue: number
  averageSaleValue: number
  averageDaysToSell: number
  salesThisMonth: number
  salesThisQuarter: number
  salesLast7Days: number
  salesLast24Hours: number
  topSellingMonth: string
}

const salesOverview = ref<SalesOverview | null>(null)

const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const fetchSalesOverview = async () => {
  try {
    const response = await axios.get<SalesOverview>(
      `/api${DEALER_ROUTE_BASE}/get-sales-overview`
    )
    salesOverview.value = response.data || null
  } catch (error) {
    console.error('Error fetching sales overview:', error)
    salesOverview.value = null
  }
}

onMounted(() => {
  fetchSalesOverview()
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
  
  .d-grid[style*="grid-template-columns: repeat(2, 1fr)"] {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>

