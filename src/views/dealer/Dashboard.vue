<template>
  <div class="panel-page dealer-dashboard">
    <PageHeader
      :title="t('dealer.views.dashboard.title')"
      :subtitle="t('dealer.views.dashboard.subtitle')"
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
      <p>{{ t('dealer.views.dashboard.loadingData') }}</p>
    </div>

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

    <div v-else-if="stats">
      <v-row class="mb-5">
        <v-col cols="12" sm="6" md="4">
          <StatMetricCard
            icon="mdi-car"
            icon-color="success"
            :value="formatNumber(stats.overview.vehicles.total)"
            :label="t('dealer.views.dashboard.totalVehicles')"
            :badge="growthBadge(stats.overview.vehicles.growth_rate)"
            :footer="{ icon: 'mdi-check-circle', text: `${stats.overview.vehicles.published} ${t('dealer.views.dashboard.published')}` }"
            :detail-link="{ to: { name: 'dealer.vehicles.overview' }, label: t('dealer.views.dashboard.viewAll') }"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <StatMetricCard
            icon="mdi-phone-in-talk"
            icon-color="primary"
            :value="formatNumber(stats.overview.leads.total)"
            :label="t('dealer.views.dashboard.totalLeads')"
            :badge="growthBadge(stats.overview.leads.growth_rate)"
            :footer="{ icon: 'mdi-calendar-week', text: `${stats.overview.leads.new_last_7_days} ${t('dealer.views.dashboard.newThisWeek')}` }"
            :detail-link="{ to: { name: 'dealer.leads.overview' }, label: t('dealer.views.dashboard.viewAll') }"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <StatMetricCard
            icon="mdi-crown"
            icon-color="warning"
            :value="stats.overview.subscription.plan_name"
            :label="t('dealer.views.dashboard.subscriptionPlan')"
            :badge="{
              text: stats.overview.subscription.is_active ? t('dealer.views.dashboard.active') : t('dealer.views.dashboard.inactive'),
              variant: stats.overview.subscription.is_active ? 'success' : 'neutral',
            }"
            :footer="{ icon: 'mdi-check-circle', text: stats.overview.subscription.status }"
          />
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <MiniStatCard
            icon="mdi-car-plus"
            icon-color="success"
            :label="t('dealer.views.dashboard.newVehicles')"
            :value="stats.overview.vehicles.new_last_30_days"
            :subtitle="t('dealer.views.dashboard.last30Days')"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <MiniStatCard
            icon="mdi-phone-in-talk"
            icon-color="primary"
            :label="t('dealer.views.dashboard.newLeads')"
            :value="stats.overview.leads.new_last_30_days"
            :subtitle="t('dealer.views.dashboard.last30Days')"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <MiniStatCard
            icon="mdi-cash"
            icon-color="warning"
            :label="t('dealer.views.dashboard.avgVehiclePrice')"
            :value="formatPrice(stats.overview.vehicles.average_price)"
            :subtitle="`${t('dealer.views.dashboard.totalValue')}: ${formatPrice(stats.overview.vehicles.total_value)}`"
          />
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card variant="flat" elevation="1">
            <v-card-title class="d-flex align-center">
              <v-icon size="20" class="mr-2">mdi-pulse</v-icon>
              {{ t('dealer.views.dashboard.marketPulseTitle') }}
            </v-card-title>
            <v-card-subtitle>{{ t('dealer.views.dashboard.marketPulseSubtitle') }}</v-card-subtitle>
            <v-card-text>
              <UpgradePrompt v-if="!canSeeMarketPulse" :feature-key="FeatureKey.MARKET_PULSE" />
              <div v-else-if="loadingMarketPulse" class="text-center py-4">
                <v-progress-circular indeterminate color="primary" size="32" />
              </div>
              <div v-else-if="marketPulse">
                <p
                  v-for="(item, key) in marketPulse.comparisons"
                  :key="key"
                  class="text-body-2 mb-2"
                >
                  {{ item.summary }}
                </p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <UpgradePrompt
            v-if="!canSeeListingHealthInbox"
            :feature-key="FeatureKey.LISTING_HEALTH_INBOX"
            class="mb-2"
          />
          <ListingAttentionInbox
            v-else
            :data="listingHealth"
            :loading="loadingListingHealth"
            @price-applied="loadDashboard"
          />
        </v-col>
      </v-row>

      <v-row v-if="canSeeFixImpact" class="mb-6">
        <v-col cols="12">
          <ListingFixImpact :items="listingHealth?.fix_impact" />
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
              <span>{{ t('dealer.views.dashboard.creationTrendTitle') }}</span>
            </v-card-title>
            <v-card-text>
              <TrendAreaChart
                :points="stats.trends.vehicles"
                color="#10b981"
                :value-label="t('dealer.views.dashboard.totalVehicles')"
              />
              <div class="trend-area-chart__labels">
                <span>{{ t('dealer.views.dashboard.thirtyDaysAgo') }}</span>
                <span>{{ t('dealer.views.dashboard.today') }}</span>
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
import { getDashboardStats, getMarketPulseWidget, getListingHealthAttention, type DashboardStats, type MarketPulseComparison, type ListingHealthAttention } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import StatMetricCard from '@/components/panel/StatMetricCard.vue'
import MiniStatCard from '@/components/panel/MiniStatCard.vue'
import TrendAreaChart from '@/components/panel/TrendAreaChart.vue'
import FinancialOverviewChart from '@/components/dealer/dashboard/FinancialOverviewChart.vue'
import ListingAttentionInbox from '@/components/dealer/dashboard/ListingAttentionInbox.vue'
import ListingFixImpact from '@/components/dealer/dashboard/ListingFixImpact.vue'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<DashboardStats | null>(null)
const marketPulse = ref<MarketPulseComparison | null>(null)
const listingHealth = ref<ListingHealthAttention | null>(null)
const loadingMarketPulse = ref(false)
const loadingListingHealth = ref(false)
const canSeeFixImpact = hasFeature(FeatureKey.LISTING_HEALTH_BEFORE_AFTER)
const canSeeMarketPulse = hasFeature(FeatureKey.MARKET_PULSE)
const canSeeListingHealthInbox = hasFeature(FeatureKey.LISTING_HEALTH_INBOX)

const loadDashboard = async () => {
  try {
    loading.value = true
    error.value = null
    stats.value = await getDashboardStats()
    if (canSeeMarketPulse) {
      loadingMarketPulse.value = true
      getMarketPulseWidget()
        .then((data) => { marketPulse.value = data })
        .catch(() => {})
        .finally(() => { loadingMarketPulse.value = false })
    }
    if (canSeeListingHealthInbox) {
      loadingListingHealth.value = true
      getListingHealthAttention()
        .then((data) => { listingHealth.value = data })
        .catch(() => {})
        .finally(() => { loadingListingHealth.value = false })
    }
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

function growthBadge(rate: number) {
  return {
    text: `${Math.abs(rate)}%`,
    variant: (rate >= 0 ? 'success' : 'error') as 'success' | 'error',
    icon: rate >= 0 ? 'mdi-trending-up' : 'mdi-trending-down',
  }
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
  const keys: Record<number, string> = {
    1: 'dealer.views.vehicles.draft',
    2: 'dealer.views.vehicles.published',
    3: 'dealer.views.vehicles.sold',
    4: 'dealer.views.vehicles.archived',
  }
  const key = keys[statusId || 0]
  return key ? t(key) : t('common.unknown')
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.dealer-dashboard {
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
