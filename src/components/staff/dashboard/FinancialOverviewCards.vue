<template>
  <div>
    <div v-if="!loading && financialOverview.length === 0" class="col-span-4 text-center text-xs" style="color: var(--muted-foreground);">
      No financial overview data available.
    </div>

    <!-- Show as one card until sm -->
    <div class="col-span-1 sm:hidden">
      <v-card v-if="loading" variant="outlined" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
        <v-card-text class="d-flex flex-column" style="gap: 1rem;">
          <div
            v-for="index in 4"
            :key="index"
            class="mb-2 d-flex flex-column"
            :style="{
              gap: '0.25rem',
              borderBottom: index < 4 ? '1px solid var(--border)' : 'none',
              paddingBottom: index < 4 ? '0.5rem' : '0',
            }"
          >
            <div class="d-flex justify-space-between align-center">
              <v-skeleton-loader type="text" width="50%" />
              <v-skeleton-loader type="text" width="32px" />
            </div>
            <v-skeleton-loader type="text" width="100%" height="32px" />
            <v-skeleton-loader type="text" width="75%" />
          </div>
        </v-card-text>
      </v-card>

      <v-card v-if="financialOverview.length > 0" variant="outlined" :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }">
        <v-card-text class="d-flex flex-column" style="gap: 1rem;">
          <div
            v-for="(overview, index) in financialOverview"
            :key="overview.type"
            class="mb-2 d-flex flex-column"
            :style="{
              gap: '0.25rem',
              borderBottom: index < financialOverview.length - 1 ? '1px solid var(--border)' : 'none',
              paddingBottom: index < financialOverview.length - 1 ? '0.5rem' : '0',
            }"
          >
            <div class="d-flex justify-space-between align-center">
              <p class="text-sm mb-0">{{ overview.type }}</p>
              <v-icon v-if="overview.type === 'Revenue'" size="small">mdi-currency-usd</v-icon>
              <v-icon v-else-if="overview.type === 'Expense'" size="small">mdi-receipt-text</v-icon>
              <v-icon v-else-if="overview.type === 'Net Profit'" size="small">mdi-chart-line</v-icon>
              <v-icon v-else-if="overview.type === 'Profit Margin'" size="small">mdi-percent</v-icon>
            </div>
            <h3 class="text-2xl font-bold mb-0">
              <template v-if="overview.type !== 'Profit Margin'">{{ overview.value.toLocaleString('da-DK') }} kr.</template>
              <template v-else>{{ parseFloat(String(overview.value)).toFixed(1) }}%</template>
            </h3>
            <p
              class="d-flex align-center text-xs mb-0"
              :style="{
                gap: '0.375rem',
                color: getChangeColor(overview),
              }"
            >
              <v-icon
                v-if="overview.percentageChange !== null"
                size="12"
                :style="{ color: getChangeColor(overview) }"
              >
                {{ getChangeIcon(overview) }}
              </v-icon>
              <template v-if="overview.percentageChange !== null">
                {{ overview.percentageChange >= 0 ? '+' : '' }}{{ overview.percentageChange.toFixed(2) }}% from last {{ overview.period.toLowerCase() }}
              </template>
              <template v-else>N/A</template>
            </p>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Show as separate cards from sm and up -->
    <div class="hidden-sm" :style="{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }">
      <v-card
        v-for="index in 4"
        v-if="loading"
        :key="index"
        variant="outlined"
        :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
        class="animate-pulse"
      >
        <v-card-text class="d-flex flex-column" style="gap: 0.25rem;">
          <div class="d-flex justify-space-between align-center">
            <v-skeleton-loader type="text" width="50%" />
            <v-skeleton-loader type="text" width="32px" />
          </div>
          <v-skeleton-loader type="text" width="100%" height="32px" />
          <v-skeleton-loader type="text" width="75%" />
        </v-card-text>
      </v-card>

      <v-card
        v-for="overview in financialOverview"
        :key="overview.type"
        variant="outlined"
        :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
      >
        <v-card-text class="d-flex flex-column" style="gap: 0.25rem;">
          <div class="d-flex justify-space-between align-center">
            <p class="text-sm mb-0">{{ overview.type }}</p>
            <v-icon v-if="overview.type === 'Revenue'" size="small">mdi-currency-usd</v-icon>
            <v-icon v-else-if="overview.type === 'Expense'" size="small">mdi-receipt-text</v-icon>
            <v-icon v-else-if="overview.type === 'Net Profit'" size="small">mdi-chart-line</v-icon>
            <v-icon v-else-if="overview.type === 'Profit Margin'" size="small">mdi-percent</v-icon>
          </div>
          <h3 class="text-2xl font-bold mb-0">
            <template v-if="overview.type !== 'Profit Margin'">₹</template>
            {{ overview.type === 'Profit Margin' ? parseFloat(String(overview.value)).toFixed(1) : overview.value.toLocaleString() }}
            <template v-if="overview.type === 'Profit Margin'">%</template>
          </h3>
          <p
            class="d-flex align-center text-xs mb-0"
            :style="{
              gap: '0.375rem',
              color: getChangeColor(overview),
            }"
          >
            <v-icon
              v-if="overview.percentageChange !== null"
              size="12"
              :style="{ color: getChangeColor(overview) }"
            >
              {{ getChangeIcon(overview) }}
            </v-icon>
            <template v-if="overview.percentageChange !== null">
              {{ overview.percentageChange >= 0 ? '+' : '' }}{{ overview.percentageChange.toFixed(2) }}% from last {{ overview.period.toLowerCase() }}
            </template>
            <template v-else>N/A</template>
          </p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { API_DEALER_BASE } from '@/constants/app'

interface FinancialOverview {
  type: string
  value: number
  percentageChange: number | null
  period: string
}

const props = defineProps<{
  period: 'week' | 'month' | 'quarter' | 'year'
}>()

const financialOverview = ref<FinancialOverview[]>([])
const loading = ref(true)

const getChangeColor = (overview: FinancialOverview) => {
  if (overview.percentageChange === null) return 'var(--muted-foreground)'
  if (overview.type === 'Expense') {
    return overview.percentageChange >= 0 ? 'var(--destructive)' : 'var(--success)'
  }
  return overview.percentageChange >= 0 ? 'var(--success)' : 'var(--destructive)'
}

const getChangeIcon = (overview: FinancialOverview) => {
  if (overview.percentageChange === null) return ''
  if (overview.type === 'Expense') {
    return overview.percentageChange >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
  }
  return overview.percentageChange >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
}

const fetchFinancialOverview = async () => {
  try {
    loading.value = true
    const response = await axios.get<FinancialOverview[]>(
      `/api${API_DEALER_BASE}/accounting/get-financial-overview?period=${props.period}`
    )
    financialOverview.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching financial overview:', error)
    financialOverview.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.period, fetchFinancialOverview, { immediate: true })
</script>

<style scoped>
.hidden-sm {
  display: none !important;
}

@media (min-width: 640px) {
  .hidden-sm {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .col-span-1.sm\:hidden {
    display: none !important;
  }
}

@media (min-width: 1024px) {
  .hidden-sm {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (min-width: 1280px) {
  .hidden-sm {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>

