<template>
  <div class="panel-page admin-dashboard">
    <PageHeader
      :title="t('admin.views.dashboard.title')"
      :subtitle="t('admin.views.dashboard.subtitle')"
    >
      <template #actions>
        <button
          type="button"
          class="panel-btn panel-btn--outline panel-btn--sm"
          :disabled="loading"
          @click="loadDashboard"
        >
          <v-icon size="14">mdi-refresh</v-icon>
          {{ t('common.refresh') }}
        </button>
      </template>
    </PageHeader>

    <div v-if="loading && !stats" class="panel-loading">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p>{{ t('admin.views.dashboard.loadingData') }}</p>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>{{ t('admin.views.dashboard.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <div v-else-if="stats">
      <v-row class="mb-5">
        <v-col cols="12" sm="6" md="3">
          <StatMetricCard
            icon="mdi-account-group"
            icon-color="primary"
            :value="formatNumber(stats.overview.users.total)"
            :label="t('admin.views.dashboard.totalUsers')"
            :badge="growthBadge(stats.overview.users.growth_rate)"
            :footer="{ icon: 'mdi-calendar-week', text: `${stats.overview.users.new_last_7_days} ${t('admin.views.dashboard.newThisWeek')}` }"
            :detail-link="{ to: { name: 'admin.users' }, label: t('admin.views.dashboard.viewAll') }"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatMetricCard
            icon="mdi-store"
            icon-color="info"
            :value="formatNumber(stats.overview.dealers.total)"
            :label="t('admin.views.dashboard.totalDealers')"
            :badge="growthBadge(stats.overview.dealers.growth_rate)"
            :footer="{ icon: 'mdi-calendar-week', text: `${stats.overview.dealers.new_last_7_days} ${t('admin.views.dashboard.newThisWeek')}` }"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatMetricCard
            icon="mdi-car"
            icon-color="success"
            :value="formatNumber(stats.overview.vehicles.total)"
            :label="t('admin.views.dashboard.totalVehicles')"
            :badge="growthBadge(stats.overview.vehicles.growth_rate)"
            :footer="{ icon: 'mdi-check-circle', text: `${stats.overview.vehicles.published} ${t('admin.views.dashboard.published')}` }"
            :detail-link="{ to: { name: 'admin.vehicles' }, label: t('admin.views.dashboard.viewAll') }"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatMetricCard
            icon="mdi-crown"
            icon-color="warning"
            :value="formatNumber(stats.overview.subscriptions.total)"
            :label="t('admin.views.dashboard.totalSubscriptions')"
            :badge="growthBadge(stats.overview.subscriptions.growth_rate)"
            :footer="{ icon: 'mdi-check-circle', text: `${stats.overview.subscriptions.active} ${t('admin.views.dashboard.active')}` }"
          />
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <MiniStatCard
            icon="mdi-account-plus"
            icon-color="primary"
            :label="t('admin.views.dashboard.newUsers')"
            :value="stats.overview.users.new_last_30_days"
            :subtitle="t('admin.views.dashboard.last30Days')"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MiniStatCard
            icon="mdi-car-plus"
            icon-color="success"
            :label="t('admin.views.dashboard.newVehicles')"
            :value="stats.overview.vehicles.new_last_30_days"
            :subtitle="t('admin.views.dashboard.last30Days')"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MiniStatCard
            icon="mdi-phone-in-talk"
            icon-color="info"
            :label="t('admin.views.dashboard.totalLeads')"
            :value="formatNumber(stats.overview.leads.total)"
            :subtitle="`${stats.overview.leads.new_last_30_days} ${t('admin.views.dashboard.new30d')}`"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MiniStatCard
            icon="mdi-cash"
            icon-color="warning"
            :label="t('admin.views.dashboard.avgVehiclePrice')"
            :value="formatPrice(stats.overview.vehicles.average_price)"
            :subtitle="`${t('admin.views.dashboard.totalValue')}: ${formatPrice(stats.overview.vehicles.total_value)}`"
          />
        </v-col>
      </v-row>

      <!-- Charts and Distributions -->
      <v-row class="mb-6">
        <!-- Vehicle Status Distribution -->
        <v-col cols="12" md="6">
          <v-card variant="flat" class="chart-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-chart-pie</v-icon>
              <span>{{ t('admin.views.dashboard.vehicleStatusDistribution') }}</span>
            </v-card-title>
            <v-card-text>
              <v-alert
                v-if="statusDistribution.archivedDominates"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                {{ t('admin.views.dashboard.archivedDominatesWarning', {
                  count: statusDistribution.archivedCount,
                  total: statusDistribution.total,
                }) }}
              </v-alert>
              <div class="distribution-chart">
                <div
                  v-for="item in statusDistribution.items"
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
                        {{ translateStatusLabel(item.status) }}
                      </v-chip>
                    </div>
                    <span class="text-body-2 font-weight-bold">{{ formatNumber(item.count) }}</span>
                  </div>
                  <v-progress-linear
                    v-if="statusDistribution.denominator > 0 && item.count > 0"
                    :model-value="(item.count / statusDistribution.denominator) * 100"
                    :color="item.color"
                    height="8"
                    rounded
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Subscription Status Distribution -->
        <v-col cols="12" md="6">
          <v-card variant="flat" class="chart-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-chart-donut</v-icon>
              <span>{{ t('admin.views.dashboard.subscriptionStatus') }}</span>
            </v-card-title>
            <v-card-text>
              <div class="distribution-chart">
                <div
                  v-for="item in stats.distributions.subscription_status"
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
                    :model-value="stats.overview.subscriptions.total > 0 ? (item.count / stats.overview.subscriptions.total) * 100 : 0"
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
        <v-col cols="12" md="6">
          <v-card variant="flat" class="chart-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-chart-line</v-icon>
              <span>{{ t('admin.views.dashboard.vehicleCreationTrend') }}</span>
            </v-card-title>
            <v-card-text>
              <TrendAreaChart
                :points="stats.trends.vehicles"
                color="#10b981"
                :value-label="t('admin.views.dashboard.totalVehicles')"
                :empty-text="t('admin.views.dashboard.noRecentVehicles')"
              />
              <div class="trend-area-chart__labels">
                <span>{{ t('admin.views.dashboard.thirtyDaysAgo') }}</span>
                <span>{{ t('common.today') }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- User Creation Trend -->
        <v-col cols="12" md="6">
          <v-card variant="flat" class="chart-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-chart-line</v-icon>
              <span>{{ t('admin.views.dashboard.userCreationTrend') }}</span>
            </v-card-title>
            <v-card-text>
              <TrendAreaChart
                :points="stats.trends.users"
                color="#03418b"
                :value-label="t('admin.views.dashboard.totalUsers')"
              />
              <div class="trend-area-chart__labels">
                <span>{{ t('admin.views.dashboard.thirtyDaysAgo') }}</span>
                <span>{{ t('common.today') }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <v-row>
        <!-- Recent Vehicles -->
        <v-col cols="12" md="6" lg="3">
          <v-card variant="flat" class="recent-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="18" class="mr-2">mdi-car</v-icon>
              <span class="text-subtitle-1">{{ t('admin.views.dashboard.recentVehicles') }}</span>
              <v-spacer />
              <v-btn
                variant="text"
                size="x-small"
                :to="{ name: 'admin.vehicles' }"
              >
                {{ t('admin.views.dashboard.viewAll') }}
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="vehicle in stats.recent.vehicles"
                  :key="vehicle.id"
                  :to="{ name: 'admin.vehicles.detail', params: { id: vehicle.id } }"
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
                  <span class="text-caption text-medium-emphasis">{{ t('admin.views.dashboard.noRecentVehicles') }}</span>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Recent Users -->
        <v-col cols="12" md="6" lg="3">
          <v-card variant="flat" class="recent-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="18" class="mr-2">mdi-account-group</v-icon>
              <span class="text-subtitle-1">{{ t('admin.views.dashboard.recentUsers') }}</span>
              <v-spacer />
              <v-btn
                variant="text"
                size="x-small"
                :to="{ name: 'admin.users' }"
              >
                {{ t('admin.views.dashboard.viewAll') }}
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="user in stats.recent.users"
                  :key="user.id"
                  :to="{ name: 'admin.users.detail', params: { id: user.id } }"
                  class="recent-item"
                >
                  <template v-slot:prepend>
                    <v-avatar size="24" color="primary">
                      <span class="text-caption">{{ user.name?.charAt(0).toUpperCase() || 'U' }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ user.name || t('common.unknown') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ user.email }} • {{ user.role }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="stats.recent.users.length === 0" class="text-center py-4">
                  <span class="text-caption text-medium-emphasis">{{ t('admin.views.dashboard.noRecentUsers') }}</span>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Recent Dealers -->
        <v-col cols="12" md="6" lg="3">
          <v-card variant="flat" class="recent-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="18" class="mr-2">mdi-store</v-icon>
              <span class="text-subtitle-1">{{ t('admin.views.dashboard.recentDealers') }}</span>
              <v-spacer />
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="dealer in stats.recent.dealers"
                  :key="dealer.id"
                  class="recent-item"
                >
                  <template v-slot:prepend>
                    <v-icon size="16" color="info">mdi-store</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ dealer.name || dealer.cvr || t('admin.views.dealers.unnamedDealer') + ` #${dealer.id}` }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    <template v-if="dealer.cvr_pending">{{ t('admin.views.dealers.pendingCvr') }}</template>
                    <template v-else-if="dealer.cvr">{{ dealer.cvr }}</template>
                    <template v-if="dealer.city || dealer.address"> · {{ dealer.city || dealer.address }}</template>
                    <template v-else-if="!dealer.cvr_pending"> · {{ t('common.noLocation') }}</template>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="stats.recent.dealers.length === 0" class="text-center py-4">
                  <span class="text-caption text-medium-emphasis">{{ t('admin.views.dashboard.noRecentDealers') }}</span>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Recent Leads -->
        <v-col cols="12" md="6" lg="3">
          <v-card variant="flat" class="recent-card" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="18" class="mr-2">mdi-phone-in-talk</v-icon>
              <span class="text-subtitle-1">{{ t('admin.views.dashboard.recentLeads') }}</span>
              <v-spacer />
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                @click="router.push({ name: 'admin.leads' })"
              >
                {{ t('admin.views.dashboard.viewAll') }}
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="lead in stats.recent.leads"
                  :key="lead.id"
                  class="recent-item"
                  @click="router.push({ name: 'admin.leads.detail', params: { id: lead.id } })"
                >
                  <template v-slot:prepend>
                    <v-icon size="16" color="success">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ lead.vehicle_title || `Lead #${lead.id}` }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ lead.buyer_name }} • {{ lead.dealer_cvr }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="stats.recent.leads.length === 0" class="text-center py-4">
                  <span class="text-caption text-medium-emphasis">{{ t('admin.views.dashboard.noRecentLeads') }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDashboardStats, type DashboardStats } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import StatMetricCard from '@/components/panel/StatMetricCard.vue'
import MiniStatCard from '@/components/panel/MiniStatCard.vue'
import TrendAreaChart from '@/components/panel/TrendAreaChart.vue'
import { translateStatus } from '@/utils/vehicleLabels'
import { buildVehicleStatusDistribution } from '@/utils/dashboardDistribution'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<DashboardStats | null>(null)

const statusDistribution = computed(() =>
  buildVehicleStatusDistribution(
    stats.value?.distributions.vehicle_status ?? [],
    stats.value?.overview.vehicles.total ?? 0,
  ),
)

function translateStatusLabel(status: string): string {
  return translateStatus(status, t)
}

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
  if (!price) return 'N/A'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function growthBadge(rate: number) {
  return {
    text: `${Math.abs(rate)}%`,
    variant: (rate >= 0 ? 'success' : 'error') as 'success' | 'error',
    icon: rate >= 0 ? 'mdi-trending-up' : 'mdi-trending-down',
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
  return names[statusId || 0] || t('common.unknown')
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.admin-dashboard {
  width: 100%;
}

.chart-card {
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
  height: 100%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.recent-card :deep(.v-card-title) {
  border-bottom: 1px solid var(--border);
}

.recent-item {
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
}

.recent-item:hover {
  background-color: var(--muted);
}

.recent-item:last-child {
  border-bottom: none;
}

@media (max-width: 960px) {
  .trend-bars {
    height: 150px;
  }
}
</style>
