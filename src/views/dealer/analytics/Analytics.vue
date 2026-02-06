<template>
  <div class="dealer-analytics">
    <!-- Header -->
    <div class="analytics-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Analytics</h1>
        <p class="text-body-1 text-medium-emphasis">
          Your dealer performance and insights
        </p>
      </div>
      <DateRangeFilter v-model="dateRange" @update:model-value="loadAllAnalytics" />
    </div>

    <!-- Loading State -->
    <div v-if="loading && !overview" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>Error Loading Analytics</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Analytics Content -->
    <div v-else-if="overview">
      <!-- Key Metrics -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            title="Active Vehicles"
            :value="overview.vehicles.total_active"
            icon="mdi-car"
            icon-color="success"
            :subtitle="`${overview.vehicles.sold} sold`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            title="Total Leads"
            :value="overview.leads.total"
            icon="mdi-phone-in-talk"
            icon-color="primary"
            :subtitle="`${overview.leads.by_type.enquiry + overview.leads.by_type.phone} enquiries`"
            subtitle-icon="mdi-phone"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            title="Conversion Rate"
            :value="overview.conversion_rate"
            icon="mdi-chart-line"
            icon-color="warning"
            format="percentage"
            :subtitle="`${overview.vehicles.sold} sold`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            title="Featured Vehicles"
            :value="overview.vehicles.featured_count"
            icon="mdi-star"
            icon-color="info"
            :subtitle="`${overview.vehicles.featured_limit} limit`"
            subtitle-icon="mdi-information"
            :badge="overview.vehicles.featured_count >= overview.vehicles.featured_limit ? 'Limit Reached' : undefined"
            badge-color="warning"
          />
        </v-col>
      </v-row>

      <!-- Lead Analytics -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-phone-in-talk</v-icon>
          <span>Lead Analytics</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingLeads" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="leadAnalytics">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Leads Over Time</h3>
                <LineChart
                  v-if="leadAnalytics.over_time.length > 0"
                  :data="{
                    labels: leadAnalytics.over_time.map((l) => l.date),
                    datasets: [{
                      label: 'Leads',
                      data: leadAnalytics.over_time.map((l) => l.count),
                      borderColor: 'rgba(54, 162, 235, 1)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      tension: 0.4,
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Leads by Source</h3>
                <PieChart
                  v-if="leadAnalytics.by_source.length > 0"
                  :data="{
                    labels: leadAnalytics.by_source.map((l) => l.source),
                    datasets: [{
                      label: 'Leads',
                      data: leadAnalytics.by_source.map((l) => l.count),
                      backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                      ],
                    }],
                  }"
                />
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Lead Status Breakdown</h3>
                <PieChart
                  v-if="leadAnalytics.status_breakdown.length > 0"
                  :data="{
                    labels: leadAnalytics.status_breakdown.map((s) => s.stage),
                    datasets: [{
                      label: 'Leads',
                      data: leadAnalytics.status_breakdown.map((s) => s.count),
                      backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                      ],
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <strong>Average Response Time:</strong> {{ leadAnalytics.average_response_time_hours }} hours
                </div>
                <h3 class="text-h6 mb-3">Top Vehicles by Leads</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Registration</th>
                      <th>Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vehicle in leadAnalytics.by_vehicle.slice(0, 10)" :key="vehicle.vehicle_id">
                      <td>{{ vehicle.title }}</td>
                      <td>{{ vehicle.registration }}</td>
                      <td>{{ vehicle.lead_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Vehicle Performance -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-car</v-icon>
          <span>Vehicle Performance</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingVehicles" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="vehicleAnalytics">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Most Viewed Vehicles</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Registration</th>
                      <th>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vehicle in vehicleAnalytics.most_viewed.slice(0, 10)" :key="vehicle.vehicle_id">
                      <td>{{ vehicle.title }}</td>
                      <td>{{ vehicle.registration }}</td>
                      <td>{{ vehicle.view_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Vehicles with Highest Leads</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Registration</th>
                      <th>Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vehicle in vehicleAnalytics.highest_leads.slice(0, 10)" :key="vehicle.vehicle_id">
                      <td>{{ vehicle.title }}</td>
                      <td>{{ vehicle.registration }}</td>
                      <td>{{ vehicle.lead_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <strong>Average Days on Market:</strong> {{ vehicleAnalytics.average_days_on_market }} days
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Recent Price Changes</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Old Price</th>
                      <th>New Price</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="change in vehicleAnalytics.price_change_history.slice(0, 10)" :key="change.vehicle_id">
                      <td>{{ change.title }}</td>
                      <td>{{ formatPrice(change.old_price) }}</td>
                      <td>{{ formatPrice(change.new_price) }}</td>
                      <td :class="change.price_change < 0 ? 'text-success' : 'text-error'">
                        {{ change.price_change > 0 ? '+' : '' }}{{ formatPrice(change.price_change) }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Marketing Analytics -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-chart-bar</v-icon>
          <span>Marketing Analytics</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingMarketing" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="marketing">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Featured vs Non-Featured Performance</h3>
                <BarChart
                  :data="{
                    labels: ['Featured', 'Non-Featured'],
                    datasets: [
                      {
                        label: 'Views',
                        data: [marketing.featured_vs_non_featured.featured_views, marketing.featured_vs_non_featured.non_featured_views],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                      },
                      {
                        label: 'Leads',
                        data: [marketing.featured_vs_non_featured.featured_leads, marketing.featured_vs_non_featured.non_featured_leads],
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                      },
                    ],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex flex-column gap-4">
                  <div>
                    <strong>Featured Vehicles:</strong> {{ marketing.featured_vs_non_featured.featured_vehicles }}
                  </div>
                  <div>
                    <strong>Featured Views:</strong> {{ marketing.featured_vs_non_featured.featured_views }}
                  </div>
                  <div>
                    <strong>Featured Leads:</strong> {{ marketing.featured_vs_non_featured.featured_leads }}
                  </div>
                  <div>
                    <strong>Non-Featured Vehicles:</strong> {{ marketing.featured_vs_non_featured.non_featured_vehicles }}
                  </div>
                  <div>
                    <strong>Non-Featured Views:</strong> {{ marketing.featured_vs_non_featured.non_featured_views }}
                  </div>
                  <div>
                    <strong>Non-Featured Leads:</strong> {{ marketing.featured_vs_non_featured.non_featured_leads }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Subscription Usage -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-crown</v-icon>
          <span>Subscription & Limits</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingSubscription" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="subscription">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <strong>Plan Name:</strong> {{ subscription.plan_name }}
                </div>
                <div class="mb-4">
                  <strong>Status:</strong> {{ subscription.status }}
                </div>
                <div v-if="subscription.renewal_date" class="mb-4">
                  <strong>Renewal Date:</strong> {{ formatDate(subscription.renewal_date) }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Feature Usage</h3>
                <div v-for="feature in subscription.features" :key="feature.feature_key" class="mb-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span>{{ feature.feature_name }}</span>
                    <span>{{ feature.used }} / {{ feature.limit }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="feature.usage_percentage"
                    :color="feature.usage_percentage >= 90 ? 'error' : feature.usage_percentage >= 75 ? 'warning' : 'success'"
                    height="8"
                    rounded
                  />
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAnalyticsOverview,
  getAnalyticsLeads,
  getAnalyticsVehicles,
  getAnalyticsMarketing,
  getAnalyticsSubscription,
} from '@/api/dealer.api'
import type {
  DealerAnalyticsOverview,
  DealerLeadAnalytics,
  DealerVehicleAnalytics,
  MarketingAnalytics,
  SubscriptionUsage,
} from '@/models/analytics.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import DateRangeFilter, { type DateRange } from '@/components/analytics/DateRangeFilter.vue'
import MetricCard from '@/components/analytics/MetricCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

const dateRange = ref<DateRange>('30d')
const loading = ref(false)
const error = ref<string | null>(null)

const overview = ref<DealerAnalyticsOverview | null>(null)
const leadAnalytics = ref<DealerLeadAnalytics | null>(null)
const vehicleAnalytics = ref<DealerVehicleAnalytics | null>(null)
const marketing = ref<MarketingAnalytics | null>(null)
const subscription = ref<SubscriptionUsage | null>(null)

const loadingLeads = ref(false)
const loadingVehicles = ref(false)
const loadingMarketing = ref(false)
const loadingSubscription = ref(false)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadOverview = async () => {
  try {
    loading.value = true
    error.value = null
    overview.value = await getAnalyticsOverview(dateRange.value)
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load overview analytics'
  } finally {
    loading.value = false
  }
}

const loadLeads = async () => {
  try {
    loadingLeads.value = true
    leadAnalytics.value = await getAnalyticsLeads(dateRange.value)
  } catch (err) {
    console.error('Failed to load lead analytics:', err)
  } finally {
    loadingLeads.value = false
  }
}

const loadVehicles = async () => {
  try {
    loadingVehicles.value = true
    vehicleAnalytics.value = await getAnalyticsVehicles(dateRange.value)
  } catch (err) {
    console.error('Failed to load vehicle analytics:', err)
  } finally {
    loadingVehicles.value = false
  }
}

const loadMarketing = async () => {
  try {
    loadingMarketing.value = true
    marketing.value = await getAnalyticsMarketing(dateRange.value)
  } catch (err) {
    console.error('Failed to load marketing analytics:', err)
  } finally {
    loadingMarketing.value = false
  }
}

const loadSubscription = async () => {
  try {
    loadingSubscription.value = true
    subscription.value = await getAnalyticsSubscription()
  } catch (err) {
    console.error('Failed to load subscription analytics:', err)
  } finally {
    loadingSubscription.value = false
  }
}

const loadAllAnalytics = async () => {
  await Promise.all([
    loadOverview(),
    loadLeads(),
    loadVehicles(),
    loadMarketing(),
    loadSubscription(),
  ])
}

onMounted(() => {
  loadAllAnalytics()
})
</script>

<style scoped>
.dealer-analytics {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.analytics-header {
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

@media (max-width: 960px) {
  .dealer-analytics {
    padding: 16px;
  }

  .analytics-header {
    flex-direction: column;
  }
}
</style>
