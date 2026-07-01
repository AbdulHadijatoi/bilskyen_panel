<template>
  <div class="dealer-analytics">
    <!-- Header -->
    <div class="analytics-header mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ t('dealer.views.analytics.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ t('dealer.views.analytics.subtitle') }}
        </p>
      </div>
      <DateRangeFilter v-model="dateRange" @update:model-value="loadAllAnalytics" />
      <div class="d-flex align-center gap-2 flex-wrap">
        <v-switch
          v-model="comparePeriod"
          :label="t('dealer.views.analytics.comparePeriod')"
          hide-details
          density="compact"
          color="primary"
          @update:model-value="loadFunnel"
        />
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn v-bind="menuProps" variant="outlined" prepend-icon="mdi-download" size="small">
              {{ t('dealer.views.analytics.export') }}
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item title="Funnel" @click="exportReport('funnel')" />
            <v-list-item title="Assignees" @click="exportReport('assignees')" />
            <v-list-item title="Stock" @click="exportReport('stock')" />
          </v-list>
        </v-menu>
      </div>
    </div>

    <v-alert
      v-if="sectionErrors.length"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <v-alert-title>{{ t('dealer.views.analytics.partialLoadWarning') }}</v-alert-title>
      <ul class="mb-0 pl-4">
        <li v-for="(msg, index) in sectionErrors" :key="index">{{ msg }}</li>
      </ul>
    </v-alert>

    <!-- Loading State -->
    <div v-if="isAnyLoading && !overview" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">{{ t('dealer.views.analytics.loadingData') }}</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>{{ t('dealer.views.analytics.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Analytics Content -->
    <div v-else-if="overview">
      <!-- Key Metrics -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('dealer.views.analytics.activeVehicles')"
            :value="overview.vehicles.total_active"
            icon="mdi-car"
            icon-color="success"
            :subtitle="`${overview.vehicles.sold} ${t('dealer.views.analytics.sold')}`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('dealer.views.analytics.totalLeads')"
            :value="overview.leads.total"
            icon="mdi-phone-in-talk"
            icon-color="primary"
            :subtitle="`${overview.leads.by_type.enquiry + overview.leads.by_type.phone} ${t('dealer.views.analytics.enquiries')}`"
            subtitle-icon="mdi-phone"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('dealer.views.analytics.conversionRate')"
            :value="overview.conversion_rate"
            icon="mdi-chart-line"
            icon-color="warning"
            format="percentage"
            :subtitle="`${overview.vehicles.sold} ${t('dealer.views.analytics.sold')}`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('dealer.views.analytics.featuredVehicles')"
            :value="overview.vehicles.featured_count"
            icon="mdi-star"
            icon-color="info"
            :subtitle="`${overview.vehicles.featured_limit} ${t('dealer.views.analytics.limit')}`"
            subtitle-icon="mdi-information"
            :badge="overview.vehicles.featured_count >= overview.vehicles.featured_limit ? t('dealer.views.analytics.limitReached') : undefined"
            badge-color="warning"
          />
        </v-col>
      </v-row>

      <!-- Conversion Funnel -->
      <v-card variant="outlined" class="mb-6">
        <v-card-title>{{ t('dealer.views.analytics.funnelTitle') }}</v-card-title>
        <v-card-text>
          <v-row v-if="funnel">
            <v-col cols="6" md="3">
              <MetricCard :title="t('dealer.views.analytics.funnelViews')" :value="funnel.current.views" icon="mdi-eye" />
            </v-col>
            <v-col cols="6" md="3">
              <MetricCard :title="t('dealer.views.analytics.funnelEnquiries')" :value="funnel.current.enquiries" icon="mdi-email" />
            </v-col>
            <v-col cols="6" md="3">
              <MetricCard :title="t('dealer.views.analytics.funnelLeads')" :value="funnel.current.leads" icon="mdi-phone" />
            </v-col>
            <v-col cols="6" md="3">
              <MetricCard :title="t('dealer.views.analytics.funnelWon')" :value="funnel.current.won" icon="mdi-trophy" icon-color="success" />
            </v-col>
          </v-row>
          <p v-if="funnel" class="text-body-2 text-medium-emphasis mt-2">
            {{ t('dealer.views.analytics.conversionRate') }}: {{ funnel.rates.view_to_won }}% (views → won)
          </p>
          <v-row v-if="funnel?.previous" class="mt-2">
            <v-col cols="12">
              <p class="text-caption text-medium-emphasis mb-2">{{ t('dealer.views.analytics.previousPeriod') }}</p>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-body-2">{{ t('dealer.views.analytics.funnelViews') }}: {{ funnel.previous.views }}</div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-body-2">{{ t('dealer.views.analytics.funnelEnquiries') }}: {{ funnel.previous.enquiries }}</div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-body-2">{{ t('dealer.views.analytics.funnelLeads') }}: {{ funnel.previous.leads }}</div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-body-2">{{ t('dealer.views.analytics.funnelWon') }}: {{ funnel.previous.won }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Trends & channels -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-card variant="outlined" class="h-100">
            <v-card-title>{{ t('dealer.views.analytics.trendsTitle') }}</v-card-title>
            <v-card-text>
              <LineChart
                v-if="trends?.series?.length"
                :data="{
                  labels: trends.series.map((p) => p.date),
                  datasets: [
                    { label: t('dealer.views.analytics.funnelViews'), data: trends.series.map((p) => p.views), borderColor: 'rgba(54, 162, 235, 1)', tension: 0.3 },
                    { label: t('dealer.views.analytics.funnelLeads'), data: trends.series.map((p) => p.leads), borderColor: 'rgba(255, 99, 132, 1)', tension: 0.3 },
                    { label: t('dealer.views.analytics.funnelWon'), data: trends.series.map((p) => p.won), borderColor: 'rgba(75, 192, 192, 1)', tension: 0.3 },
                  ],
                }"
              />
              <div v-else class="text-medium-emphasis">{{ t('common.noData') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="h-100">
            <v-card-title>{{ t('dealer.views.analytics.channelsTitle') }}</v-card-title>
            <v-card-text>
              <PieChart
                v-if="channels?.by_channel?.length"
                :data="{
                  labels: channels.by_channel.map((c) => c.channel),
                  datasets: [{
                    label: t('dealer.views.analytics.leads'),
                    data: channels.by_channel.map((c) => c.count),
                    backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)'],
                  }],
                }"
              />
              <div v-else class="text-medium-emphasis">{{ t('common.noData') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Lead Analytics -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-phone-in-talk</v-icon>
          <span>{{ t('dealer.views.analytics.leadAnalytics') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingLeads" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="leadAnalytics">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.leadsOverTime') }}</h3>
                <LineChart
                  v-if="leadAnalytics.over_time.length > 0"
                  :data="{
                    labels: leadAnalytics.over_time.map((l) => l.date),
                    datasets: [{
                      label: t('dealer.views.analytics.leads'),
                      data: leadAnalytics.over_time.map((l) => l.count),
                      borderColor: 'rgba(54, 162, 235, 1)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      tension: 0.4,
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.leadsBySource') }}</h3>
                <PieChart
                  v-if="leadAnalytics.by_source.length > 0"
                  :data="{
                    labels: leadAnalytics.by_source.map((l) => getLeadSourceName(l.source)),
                    datasets: [{
                      label: t('dealer.views.analytics.leads'),
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
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.leadStatusBreakdown') }}</h3>
                <PieChart
                  v-if="leadAnalytics.status_breakdown.length > 0"
                  :data="{
                    labels: leadAnalytics.status_breakdown.map((s) => s.stage_id ? getLeadStageName(s.stage_id) : translateApiPlaceholder(s.stage)),
                    datasets: [{
                      label: t('dealer.views.analytics.leads'),
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
                  <strong>{{ t('dealer.views.analytics.averageResponseTime') }}</strong> {{ leadAnalytics.average_response_time_hours }} {{ t('dealer.views.analytics.hours') }}
                </div>
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.topVehiclesByLeads') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('dealer.views.analytics.vehicle') }}</th>
                      <th>{{ t('dealer.views.analytics.registration') }}</th>
                      <th>{{ t('dealer.views.analytics.leads') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vehicle in leadAnalytics.by_vehicle.slice(0, 10)" :key="vehicle.vehicle_id">
                      <td>{{ translateApiPlaceholder(vehicle.title) }}</td>
                      <td>{{ translateApiPlaceholder(vehicle.registration) }}</td>
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
          <span>{{ t('dealer.views.analytics.vehiclePerformance') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingVehicles" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="vehicleAnalytics">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.mostViewedVehicles') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('dealer.views.analytics.vehicle') }}</th>
                      <th>{{ t('dealer.views.analytics.registration') }}</th>
                      <th>{{ t('dealer.views.analytics.views') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vehicle in vehicleAnalytics.most_viewed.slice(0, 10)" :key="vehicle.vehicle_id">
                      <td>{{ translateApiPlaceholder(vehicle.title) }}</td>
                      <td>{{ translateApiPlaceholder(vehicle.registration) }}</td>
                      <td>{{ vehicle.view_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.vehiclesWithHighestLeads') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('dealer.views.analytics.vehicle') }}</th>
                      <th>{{ t('dealer.views.analytics.registration') }}</th>
                      <th>{{ t('dealer.views.analytics.leads') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vehicle in vehicleAnalytics.highest_leads.slice(0, 10)" :key="vehicle.vehicle_id">
                      <td>{{ translateApiPlaceholder(vehicle.title) }}</td>
                      <td>{{ translateApiPlaceholder(vehicle.registration) }}</td>
                      <td>{{ vehicle.lead_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <strong>{{ t('dealer.views.analytics.averageDaysOnMarket') }}</strong> {{ vehicleAnalytics.average_days_on_market }} {{ t('dealer.views.analytics.days') }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.recentPriceChanges') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('dealer.views.analytics.vehicle') }}</th>
                      <th>{{ t('dealer.views.analytics.oldPrice') }}</th>
                      <th>{{ t('dealer.views.analytics.newPrice') }}</th>
                      <th>{{ t('dealer.views.analytics.change') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="change in vehicleAnalytics.price_change_history.slice(0, 10)" :key="change.vehicle_id">
                      <td>{{ translateApiPlaceholder(change.title) }}</td>
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
          <span>{{ t('dealer.views.analytics.marketingAnalytics') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingMarketing" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="marketing">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.featuredVsNonFeatured') }}</h3>
                <BarChart
                  :data="{
                    labels: [t('dealer.views.analytics.featured'), t('dealer.views.analytics.nonFeatured')],
                    datasets: [
                      {
                        label: t('dealer.views.analytics.views'),
                        data: [marketing.featured_vs_non_featured.featured_views, marketing.featured_vs_non_featured.non_featured_views],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                      },
                      {
                        label: t('dealer.views.analytics.leads'),
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
                    <strong>{{ t('dealer.views.analytics.featuredVehiclesCount') }}</strong> {{ marketing.featured_vs_non_featured.featured_vehicles }}
                  </div>
                  <div>
                    <strong>{{ t('dealer.views.analytics.featuredViewsCount') }}</strong> {{ marketing.featured_vs_non_featured.featured_views }}
                  </div>
                  <div>
                    <strong>{{ t('dealer.views.analytics.featuredLeadsCount') }}</strong> {{ marketing.featured_vs_non_featured.featured_leads }}
                  </div>
                  <div>
                    <strong>{{ t('dealer.views.analytics.nonFeaturedVehiclesCount') }}</strong> {{ marketing.featured_vs_non_featured.non_featured_vehicles }}
                  </div>
                  <div>
                    <strong>{{ t('dealer.views.analytics.nonFeaturedViewsCount') }}</strong> {{ marketing.featured_vs_non_featured.non_featured_views }}
                  </div>
                  <div>
                    <strong>{{ t('dealer.views.analytics.nonFeaturedLeadsCount') }}</strong> {{ marketing.featured_vs_non_featured.non_featured_leads }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Stock & assignees -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="h-100">
            <v-card-title>{{ t('dealer.views.analytics.stockTitle') }}</v-card-title>
            <v-card-text v-if="stock">
              <div class="mb-2"><strong>{{ t('dealer.views.analytics.soldRate') }}:</strong> {{ stock.sold_rate_percent }}%</div>
              <div class="mb-2"><strong>{{ t('dealer.views.analytics.averageDaysOnMarket') }}</strong> {{ stock.average_days_on_market }} {{ t('dealer.views.analytics.days') }}</div>
              <div class="mb-4"><strong>{{ t('dealer.views.analytics.priceDrops') }}:</strong> {{ stock.price_drops_in_period }}</div>
              <h4 class="text-subtitle-2 mb-2">{{ t('dealer.views.analytics.inventoryAging') }}</h4>
              <BarChart
                v-if="stock.inventory_aging.length"
                :data="{
                  labels: stock.inventory_aging.map((b) => b.bucket),
                  datasets: [{ label: t('dealer.views.analytics.vehicles'), data: stock.inventory_aging.map((b) => b.count), backgroundColor: 'rgba(75, 192, 192, 0.7)' }],
                }"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="h-100">
            <v-card-title>{{ t('dealer.views.analytics.assigneeTitle') }}</v-card-title>
            <v-card-text>
              <v-table v-if="assignees?.assignees?.length" density="compact">
                <thead>
                  <tr>
                    <th>{{ t('dealer.views.analytics.assigneeName') }}</th>
                    <th>{{ t('dealer.views.analytics.leads') }}</th>
                    <th>{{ t('dealer.views.analytics.winRate') }}</th>
                    <th>{{ t('dealer.views.analytics.timeToContact') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in assignees.assignees" :key="row.user_id ?? 'unassigned'">
                    <td>{{ row.name }}</td>
                    <td>{{ row.total_leads }}</td>
                    <td>{{ row.win_rate }}%</td>
                    <td>{{ row.avg_time_to_contact_hours ?? '—' }} {{ row.avg_time_to_contact_hours != null ? t('dealer.views.analytics.hours') : '' }}</td>
                  </tr>
                </tbody>
              </v-table>
              <div v-else class="text-medium-emphasis">{{ t('common.noData') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Subscription Usage -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-crown</v-icon>
          <span>{{ t('dealer.views.analytics.subscriptionLimits') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingSubscription" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="subscription">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <strong>{{ t('dealer.views.analytics.planName') }}</strong> {{ getPlanDisplayName(subscription.plan_slug, subscription.plan_name) }}
                </div>
                <div class="mb-4">
                  <strong>{{ t('dealer.views.analytics.status') }}</strong> {{ formatSubscriptionStatus(subscription.status_id, subscription.status) }}
                </div>
                <div v-if="subscription.renewal_date" class="mb-4">
                  <strong>{{ t('dealer.views.analytics.renewalDate') }}</strong> {{ formatDate(subscription.renewal_date) }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.featureUsage') }}</h3>
                <div v-for="feature in subscription.features" :key="feature.feature_key" class="mb-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span>{{ getFeatureDisplayName(feature) }}</span>
                    <span>{{ feature.used }} / {{ feature.limit }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="feature.usage_percentage"
                    :color="feature.usage_percentage >= 90 ? 'error' : feature.usage_percentage >= 75 ? 'warning' : 'success'"
                    height="8"
                    rounded
                  />
                </div>
                <div v-if="subscription.payg" class="mt-4">
                  <h3 class="text-h6 mb-3">{{ t('dealer.views.analytics.paygBurn') }}</h3>
                  <div class="mb-2">
                    <strong>{{ t('dealer.views.analytics.pendingUsage') }}:</strong> {{ formatPrice(subscription.payg.pending_usage_cents / 100) }}
                  </div>
                  <div class="mb-2">
                    <strong>{{ t('dealer.views.analytics.invoiced') }}:</strong> {{ formatPrice(subscription.payg.invoiced_cents / 100) }}
                  </div>
                  <div>
                    <strong>{{ t('dealer.views.analytics.paid') }}:</strong> {{ formatPrice(subscription.payg.paid_cents / 100) }}
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getAnalyticsOverview,
  getAnalyticsLeads,
  getAnalyticsVehicles,
  getAnalyticsMarketing,
  getAnalyticsSubscription,
  getAnalyticsFunnel,
  getAnalyticsStock,
  getAnalyticsAssignees,
  getAnalyticsChannels,
  getAnalyticsTrends,
  downloadDealerAnalyticsExport,
} from '@/api/dealer.api'
import type {
  DealerAnalyticsOverview,
  DealerLeadAnalytics,
  DealerVehicleAnalytics,
  MarketingAnalytics,
  SubscriptionUsage,
  FunnelAnalytics,
  StockAnalytics,
  AssigneeAnalytics,
  ChannelAnalytics,
  TrendAnalytics,
} from '@/models/analytics.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import DateRangeFilter, { type DateRange } from '@/components/analytics/DateRangeFilter.vue'
import MetricCard from '@/components/analytics/MetricCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { getLeadSourceName, getLeadStageName } from '@/utils/leadHelpers'
import {
  translateApiPlaceholder,
  getPlanDisplayName,
  formatSubscriptionStatus,
  getFeatureDisplayName,
} from '@/utils/analyticsDisplay'

const { t } = useI18n()
const dateRange = ref<DateRange>('30d')
const comparePeriod = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const overview = ref<DealerAnalyticsOverview | null>(null)
const leadAnalytics = ref<DealerLeadAnalytics | null>(null)
const vehicleAnalytics = ref<DealerVehicleAnalytics | null>(null)
const marketing = ref<MarketingAnalytics | null>(null)
const subscription = ref<SubscriptionUsage | null>(null)
const funnel = ref<FunnelAnalytics | null>(null)
const stock = ref<StockAnalytics | null>(null)
const assignees = ref<AssigneeAnalytics | null>(null)
const channels = ref<ChannelAnalytics | null>(null)
const trends = ref<TrendAnalytics | null>(null)

const loadingLeads = ref(false)
const loadingVehicles = ref(false)
const loadingMarketing = ref(false)
const loadingSubscription = ref(false)
const sectionErrors = ref<string[]>([])

const isAnyLoading = computed(
  () =>
    loading.value ||
    loadingLeads.value ||
    loadingVehicles.value ||
    loadingMarketing.value ||
    loadingSubscription.value
)

const recordSectionError = (section: string, err: unknown) => {
  const message = (err as ApiErrorModel).message || section
  sectionErrors.value.push(`${section}: ${message}`)
}

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
    error.value = null
    overview.value = await getAnalyticsOverview(dateRange.value)
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.analytics.failedLoadOverview')
  }
}

const loadLeads = async () => {
  try {
    loadingLeads.value = true
    leadAnalytics.value = await getAnalyticsLeads(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.leadAnalytics'), err)
  } finally {
    loadingLeads.value = false
  }
}

const loadVehicles = async () => {
  try {
    loadingVehicles.value = true
    vehicleAnalytics.value = await getAnalyticsVehicles(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.vehiclePerformance'), err)
  } finally {
    loadingVehicles.value = false
  }
}

const loadMarketing = async () => {
  try {
    loadingMarketing.value = true
    marketing.value = await getAnalyticsMarketing(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.marketingAnalytics'), err)
  } finally {
    loadingMarketing.value = false
  }
}

const loadFunnel = async () => {
  try {
    funnel.value = await getAnalyticsFunnel(dateRange.value, comparePeriod.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.funnelTitle'), err)
  }
}

const loadStock = async () => {
  try {
    stock.value = await getAnalyticsStock(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.stockTitle'), err)
  }
}

const loadAssignees = async () => {
  try {
    assignees.value = await getAnalyticsAssignees(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.assigneeTitle'), err)
  }
}

const loadChannels = async () => {
  try {
    channels.value = await getAnalyticsChannels(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.channelsTitle'), err)
  }
}

const loadTrends = async () => {
  try {
    trends.value = await getAnalyticsTrends(dateRange.value)
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.trendsTitle'), err)
  }
}

async function exportReport(report: string) {
  await downloadDealerAnalyticsExport(report, dateRange.value)
}

const loadSubscription = async () => {
  try {
    loadingSubscription.value = true
    subscription.value = await getAnalyticsSubscription()
  } catch (err) {
    recordSectionError(t('dealer.views.analytics.featureUsage'), err)
  } finally {
    loadingSubscription.value = false
  }
}

const loadAllAnalytics = async () => {
  sectionErrors.value = []
  loading.value = true
  await Promise.all([
    loadOverview(),
    loadFunnel(),
    loadStock(),
    loadAssignees(),
    loadChannels(),
    loadTrends(),
    loadLeads(),
    loadVehicles(),
    loadMarketing(),
    loadSubscription(),
  ])
  loading.value = false
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
