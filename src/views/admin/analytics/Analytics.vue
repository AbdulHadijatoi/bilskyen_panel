<template>
  <div class="admin-analytics">
    <!-- Header -->
    <div class="analytics-header mb-6">
  <div>
        <h1 class="text-h4 font-weight-bold mb-2">Analytics</h1>
        <p class="text-body-1 text-medium-emphasis">
          System-wide analytics and business insights
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
            title="Total Vehicles"
            :value="overview.vehicles.total_listed"
            icon="mdi-car"
            icon-color="success"
            :subtitle="`${overview.vehicles.active} active`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            title="Total Dealers"
            :value="overview.dealers.total"
            icon="mdi-store"
            icon-color="info"
            :subtitle="`${overview.dealers.active} active`"
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
            :subtitle="`${overview.vehicles.sold} sold vehicles`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
      </v-row>

      <!-- Revenue Analytics -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-currency-usd</v-icon>
          <span>Revenue Analytics</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingRevenue" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="revenue">
            <v-row>
              <v-col cols="12" md="4">
                <MetricCard
                  title="Total Revenue"
                  :value="revenue.total_subscription_revenue"
                  icon="mdi-cash-multiple"
                  icon-color="success"
                  format="currency"
                  card-class="mb-0"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MetricCard
                  title="Monthly Recurring"
                  :value="revenue.monthly_recurring_revenue"
                  icon="mdi-calendar-month"
                  icon-color="primary"
                  format="currency"
                  card-class="mb-0"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MetricCard
                  title="Active Subscriptions"
                  :value="revenue.subscriptions.active"
                  icon="mdi-check-circle"
                  icon-color="success"
                  :badge="`${revenue.subscriptions.churned} churned`"
                  badge-color="error"
                  card-class="mb-0"
                />
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12">
                <h3 class="text-h6 mb-4">Revenue by Plan</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>Plan Name</th>
                      <th>Active Subscriptions</th>
                      <th>Price</th>
                      <th>Billing Cycle</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="plan in revenue.revenue_by_plan" :key="plan.plan_id">
                      <td>{{ plan.plan_name }}</td>
                      <td>{{ plan.active_subscriptions }}</td>
                      <td>{{ formatPrice(plan.price) }}</td>
                      <td>{{ plan.billing_cycle }}</td>
                      <td>{{ formatPrice(plan.revenue) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Dealer Performance -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-store</v-icon>
          <span>Dealer Performance</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingDealers" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="dealers">
            <v-row>
              <v-col cols="12" md="4">
                <h3 class="text-h6 mb-3">Top Dealers by Listings</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>CVR</th>
                      <th>City</th>
                      <th>Listings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="dealer in dealers.top_by_listings.slice(0, 5)" :key="dealer.dealer_id">
                      <td>{{ dealer.cvr }}</td>
                      <td>{{ dealer.city || 'N/A' }}</td>
                      <td>{{ dealer.listings_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
              <v-col cols="12" md="4">
                <h3 class="text-h6 mb-3">Top Dealers by Leads</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>CVR</th>
                      <th>City</th>
                      <th>Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="dealer in dealers.top_by_leads.slice(0, 5)" :key="dealer.dealer_id">
                      <td>{{ dealer.cvr }}</td>
                      <td>{{ dealer.city || 'N/A' }}</td>
                      <td>{{ dealer.leads_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
      <v-col cols="12" md="4">
                <h3 class="text-h6 mb-3">Top Dealers by Sold</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>CVR</th>
                      <th>City</th>
                      <th>Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="dealer in dealers.top_by_sold.slice(0, 5)" :key="dealer.dealer_id">
                      <td>{{ dealer.cvr }}</td>
                      <td>{{ dealer.city || 'N/A' }}</td>
                      <td>{{ dealer.sold_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Vehicle Analytics -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-car</v-icon>
          <span>Vehicle Analytics</span>
        </v-card-title>
          <v-card-text>
            <div v-if="loadingVehicles" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
          <div v-else-if="vehicles">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Vehicles by Category</h3>
                <PieChart
                  v-if="vehicles.by_category.length > 0"
                  :data="{
                    labels: vehicles.by_category.map((v) => v.category),
                    datasets: [{
                      label: 'Vehicles',
                      data: vehicles.by_category.map((v) => v.count),
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
                <h3 class="text-h6 mb-3">Vehicles by Fuel Type</h3>
                <BarChart
                  v-if="vehicles.by_fuel_type.length > 0"
                  :data="{
                    labels: vehicles.by_fuel_type.map((v) => v.fuel_type),
                    datasets: [{
                      label: 'Vehicles',
                      data: vehicles.by_fuel_type.map((v) => v.count),
                      backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    }],
                  }"
                />
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Vehicles by Price Range</h3>
                <BarChart
                  v-if="vehicles.by_price_range.length > 0"
                  :data="{
                    labels: vehicles.by_price_range.map((v) => v.range),
                    datasets: [{
                      label: 'Vehicles',
                      data: vehicles.by_price_range.map((v) => v.count),
                      backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    }],
                  }"
                />
              </v-col>
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
                    <tr v-for="vehicle in vehicles.most_viewed.slice(0, 5)" :key="vehicle.vehicle_id">
                      <td>{{ vehicle.title }}</td>
                      <td>{{ vehicle.registration }}</td>
                      <td>{{ vehicle.view_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
                <div class="mt-2">
                  <strong>Average Days to Sell:</strong> {{ vehicles.average_days_to_sell }} days
                </div>
              </v-col>
            </v-row>
            </div>
          </v-card-text>
        </v-card>

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
          <div v-else-if="leads">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Leads Over Time</h3>
                <LineChart
                  v-if="leads.over_time.length > 0"
                  :data="{
                    labels: leads.over_time.map((l) => l.date),
                    datasets: [{
                      label: 'Leads',
                      data: leads.over_time.map((l) => l.count),
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
                  v-if="leads.by_source.length > 0"
                  :data="{
                    labels: leads.by_source.map((l) => l.source),
                    datasets: [{
                      label: 'Leads',
                      data: leads.by_source.map((l) => l.count),
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
              <v-col cols="12">
                <div class="d-flex gap-4 mb-4">
                  <div>
                    <strong>Conversion Rate:</strong> {{ leads.conversion_rate }}%
                  </div>
                  <div>
                    <strong>Unanswered Leads:</strong> {{ leads.unanswered_count }}
                  </div>
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
                    <tr v-for="vehicle in leads.by_vehicle.slice(0, 10)" :key="vehicle.vehicle_id">
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

      <!-- User Activity -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-account-group</v-icon>
          <span>User Activity</span>
        </v-card-title>
          <v-card-text>
          <div v-if="loadingActivity" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
          <div v-else-if="activity">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Login Activity</h3>
                <LineChart
                  v-if="activity.login_activity.length > 0"
                  :data="{
                    labels: activity.login_activity.map((a) => a.date),
                    datasets: [{
                      label: 'Logins',
                      data: activity.login_activity.map((a) => a.count),
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.4,
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Listing Creation Trends</h3>
                <LineChart
                  v-if="activity.listing_creation_trends.length > 0"
                  :data="{
                    labels: activity.listing_creation_trends.map((a) => a.date),
                    datasets: [{
                      label: 'Listings Created',
                      data: activity.listing_creation_trends.map((a) => a.count),
                      borderColor: 'rgba(255, 99, 132, 1)',
                      backgroundColor: 'rgba(255, 99, 132, 0.2)',
                      tension: 0.4,
                    }],
                  }"
                />
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
  getAnalyticsRevenue,
  getAnalyticsDealers,
  getAnalyticsVehicles,
  getAnalyticsLeads,
  getAnalyticsActivity,
} from '@/api/admin.api'
import type {
  AnalyticsOverview,
  RevenueAnalytics,
  DealerPerformance,
  VehicleAnalytics,
  LeadAnalytics,
  UserActivityAnalytics,
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

const overview = ref<AnalyticsOverview | null>(null)
const revenue = ref<RevenueAnalytics | null>(null)
const dealers = ref<DealerPerformance | null>(null)
const vehicles = ref<VehicleAnalytics | null>(null)
const leads = ref<LeadAnalytics | null>(null)
const activity = ref<UserActivityAnalytics | null>(null)

const loadingRevenue = ref(false)
const loadingDealers = ref(false)
const loadingVehicles = ref(false)
const loadingLeads = ref(false)
const loadingActivity = ref(false)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
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

const loadRevenue = async () => {
  try {
    loadingRevenue.value = true
    revenue.value = await getAnalyticsRevenue(dateRange.value)
  } catch (err) {
    console.error('Failed to load revenue analytics:', err)
  } finally {
    loadingRevenue.value = false
  }
}

const loadDealers = async () => {
  try {
    loadingDealers.value = true
    dealers.value = await getAnalyticsDealers(dateRange.value)
  } catch (err) {
    console.error('Failed to load dealer analytics:', err)
  } finally {
    loadingDealers.value = false
  }
}

const loadVehicles = async () => {
  try {
    loadingVehicles.value = true
    vehicles.value = await getAnalyticsVehicles(dateRange.value)
  } catch (err) {
    console.error('Failed to load vehicle analytics:', err)
  } finally {
    loadingVehicles.value = false
  }
}

const loadLeads = async () => {
  try {
    loadingLeads.value = true
    leads.value = await getAnalyticsLeads(dateRange.value)
  } catch (err) {
    console.error('Failed to load lead analytics:', err)
  } finally {
    loadingLeads.value = false
  }
}

const loadActivity = async () => {
  try {
    loadingActivity.value = true
    activity.value = await getAnalyticsActivity(dateRange.value)
  } catch (err) {
    console.error('Failed to load activity analytics:', err)
  } finally {
    loadingActivity.value = false
  }
}

const loadAllAnalytics = async () => {
  await Promise.all([
    loadOverview(),
    loadRevenue(),
    loadDealers(),
    loadVehicles(),
    loadLeads(),
    loadActivity(),
  ])
}

onMounted(() => {
  loadAllAnalytics()
})
</script>

<style scoped>
.admin-analytics {
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
  .admin-analytics {
    padding: 16px;
  }

  .analytics-header {
    flex-direction: column;
  }
}
</style>