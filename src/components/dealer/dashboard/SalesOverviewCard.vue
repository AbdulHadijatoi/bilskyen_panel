<template>
  <div class="sales-overview-card" :style="{ width: '100%', border: 'none', backgroundColor: 'transparent', padding: 0, paddingTop: '1.5rem', minHeight: '200px', display: 'block' }">
    <div class="sales-overview-header" :style="{ padding: 0, marginBottom: '1.5rem' }">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h3 class="text-xl font-semibold mb-0">{{ t('dealerDashboard.salesOverview') }}</h3>
          <p class="text-sm mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.salesOverviewSubtitle') }}</p>
        </div>
        <v-chip size="small" variant="outlined" prepend-icon="mdi-trending-up" class="d-flex align-center" style="gap: 0.25rem;">
          {{ salesOverview?.totalSales || 0 }} {{ t('dealerDashboard.totalSales') }}
        </v-chip>
      </div>
    </div>

    <div class="sales-overview-content" :style="{ padding: 0, paddingTop: '1.5rem', display: 'block', visibility: 'visible', opacity: 1 }">
      <div class="space-y-6" :style="{ display: 'block', visibility: 'visible', opacity: 1 }">
        <!-- Revenue Overview -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            {{ t('dealerDashboard.revenueOverview') }}
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
                <v-icon size="small">mdi-currency-usd</v-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.totalRevenue') }}</p>
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
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.averageSaleValue') }}</p>
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
                <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.avgDaysToSell') }}</p>
                <p class="text-lg font-semibold mb-0">{{ salesOverview?.averageDaysToSell || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Performance -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            {{ t('dealerDashboard.salesPerformance') }}
          </h4>
          <div class="d-grid" style="grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesThisMonth || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.salesThisMonth') }}</p>
            </div>
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesThisQuarter || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.salesThisQuarter') }}</p>
            </div>
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesLast7Days || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.sales7Days') }}</p>
            </div>
            <div class="d-grid place-content-center text-center rounded-lg border pa-3" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
              <p class="text-2xl font-bold mb-0">{{ salesOverview?.salesLast24Hours || 0 }}</p>
              <p class="text-xs mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.sales24h') }}</p>
            </div>
          </div>
        </div>

        <!-- Top Performance -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium mb-0" style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">
            {{ t('dealerDashboard.topPerformance') }}
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
              <p class="text-sm font-medium mb-0" style="color: var(--muted-foreground);">{{ t('dealerDashboard.topMonth') }}</p>
              <p class="text-lg font-semibold mb-0">{{ salesOverview?.topSellingMonth || t('common.na') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { API_DEALER_BASE } from '@/constants/app'

const { t } = useI18n()

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
  return `${value.toLocaleString('da-DK', { maximumFractionDigits: 0 })} kr.`
}

const fetchSalesOverview = async () => {
  try {
    const response = await axios.get<SalesOverview>(
      `/api${API_DEALER_BASE}/get-sales-overview`
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

