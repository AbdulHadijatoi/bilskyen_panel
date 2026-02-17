<template>
  <div class="dealer-dashboard">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ t('dealer.views.dashboard.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ t('dealer.views.dashboard.subtitle') }}
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="loadDashboard"
        :loading="loading"
        size="small"
        variant="outlined"
      >
        {{ t('common.refresh') }}
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">{{ t('dealer.views.dashboard.loadingData') }}</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>{{ t('dealer.views.dashboard.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Dashboard Content -->
    <div v-else-if="stats">
      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-card
            variant="flat"
            class="stat-card stat-card-vehicles"
            elevation="2"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <v-icon size="40" color="success">mdi-car</v-icon>
                <v-chip
                  :color="stats.overview.vehicles.growth_rate >= 0 ? 'success' : 'error'"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon start size="14">
                    {{ stats.overview.vehicles.growth_rate >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  {{ Math.abs(stats.overview.vehicles.growth_rate) }}%
                </v-chip>
              </div>
              <div class="text-h4 font-weight-bold mb-1">
                {{ formatNumber(stats.overview.vehicles.total) }}
              </div>
              <div class="text-caption text-medium-emphasis mb-2">{{ t('dealer.views.dashboard.totalVehicles') }}</div>
              <div class="text-caption">
                <v-icon size="12" class="mr-1">mdi-check-circle</v-icon>
                {{ stats.overview.vehicles.published }} {{ t('dealer.views.dashboard.published') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card
            variant="flat"
            class="stat-card stat-card-leads"
            elevation="2"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <v-icon size="40" color="primary">mdi-phone-in-talk</v-icon>
                <v-chip
                  :color="stats.overview.leads.growth_rate >= 0 ? 'success' : 'error'"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon start size="14">
                    {{ stats.overview.leads.growth_rate >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  {{ Math.abs(stats.overview.leads.growth_rate) }}%
                </v-chip>
              </div>
              <div class="text-h4 font-weight-bold mb-1">
                {{ formatNumber(stats.overview.leads.total) }}
              </div>
              <div class="text-caption text-medium-emphasis mb-2">{{ t('dealer.views.dashboard.totalLeads') }}</div>
              <div class="text-caption">
                <v-icon size="12" class="mr-1">mdi-calendar-week</v-icon>
                {{ stats.overview.leads.new_last_7_days }} {{ t('dealer.views.dashboard.newThisWeek') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card
            variant="flat"
            class="stat-card stat-card-subscription"
            elevation="2"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <v-icon size="40" color="warning">mdi-crown</v-icon>
                <v-chip
                  :color="stats.overview.subscription.is_active ? 'success' : 'grey'"
                  size="x-small"
                  variant="flat"
                >
                  {{ stats.overview.subscription.is_active ? t('dealer.views.dashboard.active') : t('dealer.views.dashboard.inactive') }}
                </v-chip>
              </div>
              <div class="text-h4 font-weight-bold mb-1">
                {{ stats.overview.subscription.plan_name }}
              </div>
              <div class="text-caption text-medium-emphasis mb-2">{{ t('dealer.views.dashboard.subscriptionPlan') }}</div>
              <div class="text-caption">
                <v-icon size="12" class="mr-1">mdi-check-circle</v-icon>
                {{ stats.overview.subscription.status }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Secondary Stats Row -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-card variant="flat" class="secondary-stat-card" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center gap-2 mb-2">
                <v-icon size="20" color="success">mdi-car-plus</v-icon>
                <span class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.newVehicles') }}</span>
              </div>
              <div class="text-h6 font-weight-bold">{{ stats.overview.vehicles.new_last_30_days }}</div>
              <div class="text-caption text-medium-emphasis">Last 30 days</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card variant="flat" class="secondary-stat-card" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center gap-2 mb-2">
                <v-icon size="20" color="primary">mdi-phone-in-talk</v-icon>
                <span class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.newLeads') }}</span>
              </div>
              <div class="text-h6 font-weight-bold">{{ stats.overview.leads.new_last_30_days }}</div>
              <div class="text-caption text-medium-emphasis">Last 30 days</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card variant="flat" class="secondary-stat-card" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center gap-2 mb-2">
                <v-icon size="20" color="warning">mdi-currency-usd</v-icon>
                <span class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.avgVehiclePrice') }}</span>
              </div>
              <div class="text-h6 font-weight-bold">{{ formatPrice(stats.overview.vehicles.average_price) }}</div>
              <div class="text-caption text-medium-emphasis">Total value: {{ formatPrice(stats.overview.vehicles.total_value) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts and Distributions -->
      <v-row class="mb-6">
        <!-- Vehicle Status Distribution -->
        <v-col cols="12">
          <v-card variant="flat" class="chart-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-chart-pie</v-icon>
              <span>{{ t('dealer.views.dashboard.vehicleStatusDistribution') }}</span>
            </v-card-title>
            <v-card-text>
              <div class="distribution-chart">
                <div
                  v-for="item in stats.distributions.vehicle_status"
                  :key="item.status"
                  class="distribution-item mb-3"
                >
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center gap-2">
                      <v-chip
                        :color="item.color"
                        size="x-small"
                        variant="flat"
                      >
                        {{ item.status }}
                      </v-chip>
                    </div>
                    <span class="text-body-2 font-weight-bold">{{ formatNumber(item.count) }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(item.count / stats.overview.vehicles.total) * 100"
                    :color="item.color"
                    height="8"
                    rounded
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Trends Charts -->
      <v-row class="mb-6">
        <!-- Vehicle Creation Trend -->
        <v-col cols="12">
          <v-card variant="flat" class="chart-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-chart-line</v-icon>
              <span>Vehicle Creation Trend (30 Days)</span>
            </v-card-title>
            <v-card-text>
              <div class="trend-chart">
                <div class="trend-bars">
                  <div
                    v-for="(day, index) in stats.trends.vehicles"
                    :key="index"
                    class="trend-bar-item"
                    :style="{ height: `${Math.max((day.count / Math.max(...stats.trends.vehicles.map(d => d.count), 1)) * 100, 5)}%` }"
                    :title="t('dealer.views.dashboard.dayCountVehicles', { date: day.date, count: day.count })"
                  />
                </div>
                <div class="trend-labels">
                  <span class="text-caption text-medium-emphasis">30 days ago</span>
                  <span class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.today') }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Financial Overview Chart -->
      <v-row class="mb-6">
        <v-col cols="12">
    <FinancialOverviewChart />
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <v-row>
        <!-- Recent Vehicles -->
        <v-col cols="12" md="6" lg="4">
          <v-card variant="flat" class="recent-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="18" class="mr-2">mdi-car</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.dashboard.recentVehicles') }}</span>
              <v-spacer />
              <v-btn
                variant="text"
                size="x-small"
                :to="{ name: 'dealer.vehicles.overview' }"
              >
                View All
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="vehicle in stats.recent.vehicles"
                  :key="vehicle.id"
                  :to="{ name: 'dealer.vehicles.detail', params: { id: vehicle.id } }"
                  class="recent-item"
                >
                  <template v-slot:prepend>
                    <v-icon size="16" color="medium-emphasis">mdi-car</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ vehicle.title || `Vehicle #${vehicle.id}` }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ vehicle.registration || t('common.noRegistration') }} • {{ formatPrice(vehicle.price) }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip
                      :color="getVehicleStatusColor(vehicle.status)"
                      size="x-small"
                      variant="flat"
                    >
                      {{ getVehicleStatusName(vehicle.status) }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-list-item v-if="stats.recent.vehicles.length === 0" class="text-center py-4">
                  <span class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.noRecentVehicles') }}</span>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Recent Leads -->
        <v-col cols="12" md="6" lg="4">
          <v-card variant="flat" class="recent-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="18" class="mr-2">mdi-phone-in-talk</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.dashboard.recentLeads') }}</span>
              <v-spacer />
              <v-btn
                variant="text"
                size="x-small"
                :to="{ name: 'dealer.leads.overview' }"
              >
                View All
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="lead in stats.recent.leads"
                  :key="lead.id"
                  :to="{ name: 'dealer.leads.detail', params: { id: lead.id } }"
                  class="recent-item"
                >
                  <template v-slot:prepend>
                    <v-icon size="16" color="primary">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ lead.vehicle_title || `Lead #${lead.id}` }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ lead.buyer_name }} • {{ formatDate(lead.created_at) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="stats.recent.leads.length === 0" class="text-center py-4">
                  <span class="text-caption text-medium-emphasis">{{ t('dealer.views.dashboard.noRecentLeads') }}</span>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDashboardStats, type DashboardStats } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import FinancialOverviewChart from '@/components/dealer/dashboard/FinancialOverviewChart.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<DashboardStats | null>(null)

const loadDashboard = async () => {
  try {
    loading.value = true
    error.value = null
    stats.value = await getDashboardStats()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.dashboard.failedLoadData')
  } finally {
    loading.value = false
  }
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('da-DK').format(num)
}

const formatPrice = (price: number) => {
  if (!price) return '-'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const getVehicleStatusColor = (statusId?: number) => {
  const colors: Record<number, string> = {
    1: 'warning', // Draft
    2: 'success', // Published
    3: 'info', // Sold
    4: 'grey', // Archived
  }
  return colors[statusId || 0] || 'grey'
}

const getVehicleStatusName = (statusId?: number) => {
  const names: Record<number, string> = {
    1: 'Draft',
    2: 'Published',
    3: 'Sold',
    4: 'Archived',
  }
  return names[statusId || 0] || 'Unknown'
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.dealer-dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.5), transparent);
}

.stat-card-vehicles::before {
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-success), 0.5), transparent);
}

.stat-card-leads::before {
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.5), transparent);
}

.stat-card-subscription::before {
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-warning), 0.5), transparent);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.secondary-stat-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.secondary-stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.chart-card {
  border-radius: 12px;
  height: 100%;
}

.distribution-chart {
  padding: 8px 0;
}

.distribution-item {
  min-height: 40px;
}

.trend-chart {
  padding: 16px 0;
  min-height: 200px;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2px;
  height: 180px;
  padding: 0 8px;
  margin-bottom: 8px;
}

.trend-bar-item {
  flex: 1;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.8) 0%, rgba(var(--v-theme-primary), 0.4) 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.trend-bar-item:hover {
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 1) 0%, rgba(var(--v-theme-primary), 0.6) 100%);
  transform: scaleY(1.1);
}

.trend-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
}

.recent-card {
  border-radius: 12px;
  height: 100%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.recent-card :deep(.v-card-title) {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.recent-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease;
}

.recent-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.recent-item:last-child {
  border-bottom: none;
}

@media (max-width: 960px) {
  .dealer-dashboard {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
  }

  .trend-bars {
    height: 150px;
  }
}
</style>
