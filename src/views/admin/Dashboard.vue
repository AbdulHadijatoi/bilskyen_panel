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
      <v-row class="recent-feed-row">
        <v-col cols="12" md="6" xl="3">
          <DashboardRecentFeedCard
            :title="t('admin.views.dashboard.recentVehicles')"
            icon="mdi-car-outline"
            icon-color="primary"
            :view-all-to="{ name: 'admin.vehicles' }"
            :view-all-label="t('admin.views.dashboard.viewAll')"
            :empty-text="t('admin.views.dashboard.noRecentVehicles')"
            :has-items="stats.recent.vehicles.length > 0"
          >
            <DashboardRecentFeedItem
              v-for="vehicle in stats.recent.vehicles"
              :key="vehicle.id"
              :title="vehicle.title || `Vehicle #${vehicle.id}`"
              :subtitle="formatVehicleMeta(vehicle)"
              :time="formatRecentTime(vehicle.created_at)"
              :to="{ name: 'admin.vehicles.detail', params: { id: vehicle.id } }"
              prepend-icon="mdi-car-side"
              prepend-icon-color="primary"
              :chips="[{ text: getVehicleStatusName(vehicle.status), color: getVehicleStatusColor(vehicle.status) }]"
            />
          </DashboardRecentFeedCard>
        </v-col>

        <v-col cols="12" md="6" xl="3">
          <DashboardRecentFeedCard
            :title="t('admin.views.dashboard.recentUsers')"
            icon="mdi-account-group-outline"
            icon-color="info"
            :view-all-to="{ name: 'admin.users' }"
            :view-all-label="t('admin.views.dashboard.viewAll')"
            :empty-text="t('admin.views.dashboard.noRecentUsers')"
            :has-items="stats.recent.users.length > 0"
          >
            <DashboardRecentFeedItem
              v-for="user in stats.recent.users"
              :key="user.id"
              :title="user.name || t('common.unknown')"
              :subtitle="user.email"
              :time="formatRecentTime(user.created_at)"
              :to="{ name: 'admin.users.detail', params: { id: user.id } }"
              :avatar-text="(user.name?.charAt(0) || 'U').toUpperCase()"
              avatar-color="info"
              :chips="user.role ? [{ text: user.role, color: 'grey' }] : undefined"
            />
          </DashboardRecentFeedCard>
        </v-col>

        <v-col cols="12" md="6" xl="3">
          <DashboardRecentFeedCard
            :title="t('admin.views.dashboard.recentDealers')"
            icon="mdi-store-outline"
            icon-color="warning"
            :view-all-to="{ name: 'admin.dealers' }"
            :view-all-label="t('admin.views.dashboard.viewAll')"
            :empty-text="t('admin.views.dashboard.noRecentDealers')"
            :has-items="stats.recent.dealers.length > 0"
          >
            <DashboardRecentFeedItem
              v-for="dealer in stats.recent.dealers"
              :key="dealer.id"
              :title="dealer.name || dealer.cvr || `${t('admin.views.dealers.unnamedDealer')} #${dealer.id}`"
              :subtitle="formatDealerMeta(dealer)"
              :time="formatRecentTime(dealer.created_at)"
              :to="{ name: 'admin.dealers.detail', params: { id: dealer.id } }"
              prepend-icon="mdi-storefront-outline"
              prepend-icon-color="warning"
            />
          </DashboardRecentFeedCard>
        </v-col>

        <v-col cols="12" md="6" xl="3">
          <DashboardRecentFeedCard
            :title="t('admin.views.dashboard.recentLeads')"
            icon="mdi-phone-in-talk-outline"
            icon-color="success"
            :view-all-to="{ name: 'admin.leads' }"
            :view-all-label="t('admin.views.dashboard.viewAll')"
            :empty-text="t('admin.views.dashboard.noRecentLeads')"
            :has-items="stats.recent.leads.length > 0"
          >
            <DashboardRecentFeedItem
              v-for="lead in stats.recent.leads"
              :key="lead.id"
              :title="lead.buyer_name || `Lead #${lead.id}`"
              :subtitle="formatLeadMeta(lead)"
              :time="formatRecentTime(lead.created_at)"
              :to="{ name: 'admin.leads.detail', params: { id: lead.id } }"
              prepend-icon="mdi-account-voice"
              prepend-icon-color="success"
              :chips="lead.stage_id ? [{ text: getStageName(lead.stage_id), color: getStageColor(lead.stage_id) }] : undefined"
            />
          </DashboardRecentFeedCard>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDashboardStats, type DashboardStats } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import StatMetricCard from '@/components/panel/StatMetricCard.vue'
import MiniStatCard from '@/components/panel/MiniStatCard.vue'
import TrendAreaChart from '@/components/panel/TrendAreaChart.vue'
import DashboardRecentFeedCard from '@/components/panel/DashboardRecentFeedCard.vue'
import DashboardRecentFeedItem from '@/components/panel/DashboardRecentFeedItem.vue'
import { translateStatus } from '@/utils/vehicleLabels'
import { buildVehicleStatusDistribution } from '@/utils/dashboardDistribution'
import { formatLeadDate, getStageName, getStageColor } from '@/utils/leadHelpers'

const { t } = useI18n()

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

const formatRecentTime = (date?: string | null) => {
  if (!date) return undefined
  return formatLeadDate(date)
}

const formatVehicleMeta = (vehicle: { registration?: string; price?: number; dealer_name?: string }) => {
  const parts = [
    vehicle.registration || t('common.noRegistration'),
    formatPrice(vehicle.price ?? 0),
  ]
  if (vehicle.dealer_name) {
    parts.push(vehicle.dealer_name)
  }
  return parts.join(' · ')
}

const formatDealerMeta = (dealer: { cvr?: string | null; cvr_pending?: boolean; city?: string; address?: string }) => {
  const parts: string[] = []
  if (dealer.cvr_pending) {
    parts.push(t('admin.views.dealers.pendingCvr'))
  } else if (dealer.cvr) {
    parts.push(dealer.cvr)
  }
  if (dealer.city || dealer.address) {
    parts.push(dealer.city || dealer.address || '')
  } else if (!dealer.cvr_pending) {
    parts.push(t('common.noLocation'))
  }
  return parts.filter(Boolean).join(' · ')
}

const formatLeadMeta = (lead: { vehicle_title?: string; dealer_cvr?: string }) => {
  const parts = [lead.vehicle_title || t('common.na')]
  if (lead.dealer_cvr) {
    parts.push(lead.dealer_cvr)
  }
  return parts.join(' · ')
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

.recent-feed-row {
  margin-top: 0.25rem;
}

.recent-feed-row > .v-col {
  display: flex;
}

@media (max-width: 960px) {
  .trend-bars {
    height: 150px;
  }
}
</style>
