<template>
  <div class="panel-page admin-analytics">
    <!-- Header -->
    <PageHeader
      :title="t('admin.views.analytics.title')"
      :subtitle="t('admin.views.analytics.subtitle')"
    >
      <template #actions>
        <div class="d-flex align-center gap-2 flex-wrap">
          <DateRangeFilter v-model="dateRange" @update:model-value="loadAllAnalytics" />
          <v-switch
            v-model="comparePeriod"
            :label="t('admin.views.analytics.comparePeriod')"
            hide-details
            density="compact"
            color="primary"
            @update:model-value="loadFunnel"
          />
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" variant="outlined" prepend-icon="mdi-download" size="small">
                {{ t('admin.views.analytics.export') }}
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item :title="t('admin.views.analytics.funnelTitle')" @click="exportReport('funnel')" />
              <v-list-item :title="t('admin.views.analytics.cohortTitle')" @click="exportReport('cohort')" />
            </v-list>
          </v-menu>
        </div>
      </template>
    </PageHeader>

    <v-alert
      v-if="sectionErrors.length"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <v-alert-title>{{ t('admin.views.analytics.partialLoadWarning') }}</v-alert-title>
      <ul class="mb-0 pl-4">
        <li v-for="(msg, index) in sectionErrors" :key="index">{{ msg }}</li>
      </ul>
    </v-alert>

    <!-- Loading State -->
    <div v-if="isAnyLoading && !overview" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">{{ t('admin.views.analytics.loadingData') }}</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>{{ t('admin.views.analytics.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Analytics Content -->
    <div v-else-if="overview">
      <!-- Key Metrics -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('admin.views.analytics.totalVehicles')"
            :value="overview.vehicles.total_listed"
            icon="mdi-car"
            icon-color="success"
            :subtitle="`${overview.vehicles.active} ${t('admin.views.analytics.active')}`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('admin.views.analytics.totalDealers')"
            :value="overview.dealers.total"
            icon="mdi-store"
            icon-color="info"
            :subtitle="`${overview.dealers.active} ${t('admin.views.analytics.active')}`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('admin.views.analytics.totalLeads')"
            :value="overview.leads.total"
            icon="mdi-phone-in-talk"
            icon-color="primary"
            :subtitle="`${overview.leads.by_type.enquiry + overview.leads.by_type.phone} ${t('admin.views.analytics.enquiries')}`"
            subtitle-icon="mdi-phone"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <MetricCard
            :title="t('admin.views.analytics.conversionRate')"
            :value="overview.conversion_rate"
            icon="mdi-chart-line"
            icon-color="warning"
            format="percentage"
            :subtitle="`${overview.vehicles.sold} ${t('admin.views.analytics.soldVehicles')}`"
            subtitle-icon="mdi-check-circle"
          />
        </v-col>
      </v-row>

      <!-- Platform funnel -->
      <v-card variant="outlined" class="mb-6">
        <v-card-title>{{ t('admin.views.analytics.funnelTitle') }}</v-card-title>
        <v-card-text>
          <v-row v-if="funnel">
            <v-col cols="6" md="3">
              <MetricCard :title="t('admin.views.analytics.views')" :value="funnel.current.views" icon="mdi-eye" />
            </v-col>
            <v-col cols="6" md="3">
              <MetricCard :title="t('admin.views.analytics.enquiries')" :value="funnel.current.enquiries" icon="mdi-email" />
            </v-col>
            <v-col cols="6" md="3">
              <MetricCard :title="t('admin.views.analytics.leads')" :value="funnel.current.leads" icon="mdi-phone" />
            </v-col>
            <v-col cols="6" md="3">
              <MetricCard :title="t('admin.views.analytics.funnelWon')" :value="funnel.current.won" icon="mdi-trophy" icon-color="success" />
            </v-col>
          </v-row>
          <p v-if="funnel" class="text-body-2 text-medium-emphasis mt-2">
            {{ t('admin.views.analytics.conversionRateLabel') }} {{ funnel.rates.view_to_won }}%
          </p>
        </v-card-text>
      </v-card>

      <v-card variant="outlined" class="mb-6">
        <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
          <span>{{ t('admin.views.analytics.adsFunnelTitle') }}</span>
          <v-btn-toggle
            v-model="adsFunnelSource"
            mandatory
            density="compact"
            variant="outlined"
            divided
            @update:model-value="loadAdsFunnel"
          >
            <v-btn value="meta" size="small">{{ t('admin.views.analytics.adsSourceMeta') }}</v-btn>
            <v-btn value="other" size="small">{{ t('admin.views.analytics.adsSourceOther') }}</v-btn>
            <v-btn value="all" size="small">{{ t('admin.views.analytics.adsSourceAll') }}</v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ t('admin.views.analytics.adsFunnelSubtitle') }}</p>
          <v-row v-if="adsFunnel">
            <v-col cols="6" md>
              <MetricCard :title="t('admin.views.analytics.adsLanded')" :value="adsFunnel.steps.landed" icon="mdi-login" />
            </v-col>
            <v-col cols="6" md>
              <MetricCard :title="t('admin.views.analytics.adsEngaged')" :value="adsFunnel.steps.engaged" icon="mdi-gesture-tap" />
              <div class="text-caption text-medium-emphasis mt-1">{{ t('admin.views.analytics.adsDropoff') }} {{ adsDropoff(adsFunnel.steps.landed, adsFunnel.steps.engaged) }}%</div>
            </v-col>
            <v-col cols="6" md>
              <MetricCard :title="t('admin.views.analytics.adsCta')" :value="adsFunnel.steps.cta" icon="mdi-cursor-default-click" />
              <div class="text-caption text-medium-emphasis mt-1">{{ t('admin.views.analytics.adsDropoff') }} {{ adsDropoff(adsFunnel.steps.engaged, adsFunnel.steps.cta) }}%</div>
            </v-col>
            <v-col cols="6" md>
              <MetricCard :title="t('admin.views.analytics.adsFormOpen')" :value="adsFunnel.steps.form_open" icon="mdi-form-select" />
              <div class="text-caption text-medium-emphasis mt-1">{{ t('admin.views.analytics.adsDropoff') }} {{ adsDropoff(adsFunnel.steps.cta, adsFunnel.steps.form_open) }}%</div>
            </v-col>
            <v-col cols="6" md>
              <MetricCard :title="t('admin.views.analytics.adsConverted')" :value="adsFunnel.steps.converted" icon="mdi-check-bold" icon-color="success" />
              <div class="text-caption text-medium-emphasis mt-1">{{ t('admin.views.analytics.adsDropoff') }} {{ adsDropoff(adsFunnel.steps.form_open, adsFunnel.steps.converted) }}%</div>
            </v-col>
          </v-row>
          <p v-if="adsFunnel" class="text-body-2 text-medium-emphasis mt-3">
            {{ t('admin.views.analytics.conversionRateLabel') }} {{ adsFunnel.rates.landed_to_converted }}%
            · {{ t('admin.views.analytics.adsFormErrors') }}: {{ adsFunnel.form_errors }}
            · {{ t('admin.views.analytics.adsFormCloses') }}: {{ adsFunnel.form_closes }}
          </p>
          <p v-if="adsFunnel" class="text-body-2 mt-1">
            {{ t('admin.views.analytics.adsMetaVsOther') }}:
            Meta {{ adsFunnel.compare.meta_conversion_rate }}%
            ({{ adsFunnel.compare.meta_converted }}/{{ adsFunnel.compare.meta_landed }})
            · {{ t('admin.views.analytics.adsSourceOther') }} {{ adsFunnel.compare.other_conversion_rate }}%
            ({{ adsFunnel.compare.other_converted }}/{{ adsFunnel.compare.other_landed }})
          </p>
          <h4 v-if="adsFunnel" class="text-subtitle-2 mt-4 mb-2">{{ t('admin.views.analytics.adsVehiclesTitle') }}</h4>
          <v-table v-if="adsFunnel?.vehicles?.length" density="compact">
            <thead>
              <tr>
                <th>{{ t('admin.views.analytics.vehicle') }}</th>
                <th class="text-end">{{ t('admin.views.analytics.adsLanded') }}</th>
                <th class="text-end">{{ t('admin.views.analytics.adsEngaged') }}</th>
                <th class="text-end">{{ t('admin.views.analytics.adsCta') }}</th>
                <th class="text-end">{{ t('admin.views.analytics.adsConverted') }}</th>
                <th class="text-end">{{ t('admin.views.analytics.adsConversionPct') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in adsFunnel.vehicles" :key="row.vehicle_id">
                <td>{{ row.title || row.slug || row.vehicle_id }}</td>
                <td class="text-end">{{ row.landed }}</td>
                <td class="text-end">{{ row.engaged }}</td>
                <td class="text-end">{{ row.cta }}</td>
                <td class="text-end">{{ row.converted }}</td>
                <td class="text-end">{{ row.conversion_rate }}%</td>
              </tr>
            </tbody>
          </v-table>
          <div v-else-if="adsFunnel" class="text-medium-emphasis">{{ t('common.noData') }}</div>
        </v-card-text>
      </v-card>

      <!-- Trends -->
      <v-card variant="outlined" class="mb-6">
        <v-card-title>{{ t('admin.views.analytics.trendsTitle') }}</v-card-title>
        <v-card-text>
          <LineChart
            v-if="trends?.series?.length"
            :data="{
              labels: trends.series.map((p) => p.date),
              datasets: [
                { label: t('admin.views.analytics.views'), data: trends.series.map((p) => p.views), borderColor: 'rgba(54, 162, 235, 1)', tension: 0.3 },
                { label: t('admin.views.analytics.leads'), data: trends.series.map((p) => p.leads), borderColor: 'rgba(255, 99, 132, 1)', tension: 0.3 },
              ],
            }"
          />
          <div v-else class="text-medium-emphasis">{{ t('common.noData') }}</div>
        </v-card-text>
      </v-card>

      <!-- Revenue Analytics -->
      <v-card variant="outlined" class="mb-6" style="border-color: rgba(0, 0, 0, 0.12);">
        <v-card-title class="d-flex align-center">
          <v-icon size="20" class="mr-2">mdi-cash</v-icon>
          <span>{{ t('admin.views.analytics.revenueAnalytics') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingRevenue" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="revenue">
            <v-row>
              <v-col cols="12" md="4">
                <MetricCard
                  :title="t('admin.views.analytics.totalRevenue')"
                  :value="revenue.total_subscription_revenue"
                  icon="mdi-cash-multiple"
                  icon-color="success"
                  format="currency"
                  card-class="mb-0"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MetricCard
                  :title="t('admin.views.analytics.monthlyRecurring')"
                  :value="revenue.monthly_recurring_revenue"
                  icon="mdi-calendar-month"
                  icon-color="primary"
                  format="currency"
                  card-class="mb-0"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MetricCard
                  :title="t('admin.views.analytics.activeSubscriptions')"
                  :value="revenue.subscriptions.active"
                  icon="mdi-check-circle"
                  icon-color="success"
                  :badge="`${revenue.subscriptions.churned} ${t('admin.views.analytics.churned')}`"
                  badge-color="error"
                  card-class="mb-0"
                />
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12">
                <h3 class="text-h6 mb-4">{{ t('admin.views.analytics.revenueByPlan') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('admin.views.analytics.planName') }}</th>
                      <th>{{ t('admin.views.analytics.activeSubscriptionsCol') }}</th>
                      <th>{{ t('admin.views.analytics.price') }}</th>
                      <th>{{ t('admin.views.analytics.billingCycle') }}</th>
                      <th>{{ t('admin.views.analytics.revenue') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="plan in revenue.revenue_by_plan" :key="plan.plan_id">
                      <td>{{ plan.plan_name }}</td>
                      <td>{{ plan.active_subscriptions }}</td>
                      <td>{{ formatPrice(plan.price) }}</td>
                      <td>{{ formatBillingCycle(plan.billing_cycle) }}</td>
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
          <span>{{ t('admin.views.analytics.dealerPerformance') }}</span>
        </v-card-title>
        <v-card-text>
          <div v-if="loadingDealers" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="dealers">
            <v-row>
              <v-col cols="12" md="4">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.topDealersByListings') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('admin.views.analytics.cvr') }}</th>
                      <th>{{ t('admin.views.analytics.city') }}</th>
                      <th>{{ t('admin.views.analytics.listings') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="dealer in dealers.top_by_listings.slice(0, 5)" :key="dealer.dealer_id">
                      <td>{{ dealer.cvr }}</td>
                      <td>{{ dealer.city || t('common.na') }}</td>
                      <td>{{ dealer.listings_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
              <v-col cols="12" md="4">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.topDealersByLeads') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('admin.views.analytics.cvr') }}</th>
                      <th>{{ t('admin.views.analytics.city') }}</th>
                      <th>{{ t('admin.views.analytics.leads') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="dealer in dealers.top_by_leads.slice(0, 5)" :key="dealer.dealer_id">
                      <td>{{ dealer.cvr }}</td>
                      <td>{{ dealer.city || t('common.na') }}</td>
                      <td>{{ dealer.leads_count }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
      <v-col cols="12" md="4">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.topDealersBySold') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('admin.views.analytics.cvr') }}</th>
                      <th>{{ t('admin.views.analytics.city') }}</th>
                      <th>{{ t('admin.views.analytics.sold') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="dealer in dealers.top_by_sold.slice(0, 5)" :key="dealer.dealer_id">
                      <td>{{ dealer.cvr }}</td>
                      <td>{{ dealer.city || t('common.na') }}</td>
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
          <span>{{ t('admin.views.analytics.vehicleAnalytics') }}</span>
        </v-card-title>
          <v-card-text>
            <div v-if="loadingVehicles" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
          <div v-else-if="vehicles">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.vehiclesByCategory') }}</h3>
                <PieChart
                  v-if="vehicles.by_category.length > 0"
                  :data="{
                    labels: vehicles.by_category.map((v) => v.category),
                    datasets: [{
                      label: t('admin.views.analytics.vehicles'),
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
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.vehiclesByFuelType') }}</h3>
                <BarChart
                  v-if="vehicles.by_fuel_type.length > 0"
                  :data="{
                    labels: vehicles.by_fuel_type.map((v) => v.fuel_type),
                    datasets: [{
                      label: t('admin.views.analytics.vehicles'),
                      data: vehicles.by_fuel_type.map((v) => v.count),
                      backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    }],
                  }"
                />
              </v-col>
            </v-row>
            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.vehiclesByPriceRange') }}</h3>
                <BarChart
                  v-if="vehicles.by_price_range.length > 0"
                  :data="{
                    labels: vehicles.by_price_range.map((v) => v.range),
                    datasets: [{
                      label: t('admin.views.analytics.vehicles'),
                      data: vehicles.by_price_range.map((v) => v.count),
                      backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.mostViewedVehicles') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('admin.views.analytics.vehicle') }}</th>
                      <th>{{ t('admin.views.analytics.registration') }}</th>
                      <th>{{ t('admin.views.analytics.views') }}</th>
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
                  <strong>{{ t('admin.views.analytics.averageDaysToSell') }}</strong> {{ vehicles.average_days_to_sell }} {{ t('admin.views.analytics.days') }}
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
          <span>{{ t('admin.views.analytics.leadAnalytics') }}</span>
        </v-card-title>
          <v-card-text>
            <div v-if="loadingLeads" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
          <div v-else-if="leads">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.leadsOverTime') }}</h3>
                <LineChart
                  v-if="leads.over_time.length > 0"
                  :data="{
                    labels: leads.over_time.map((l) => l.date),
                    datasets: [{
                      label: t('admin.views.analytics.leads'),
                      data: leads.over_time.map((l) => l.count),
                      borderColor: 'rgba(54, 162, 235, 1)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      tension: 0.4,
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.leadsBySource') }}</h3>
                <PieChart
                  v-if="leads.by_source.length > 0"
                  :data="{
                    labels: leads.by_source.map((l) => getLeadSourceName(l.source)),
                    datasets: [{
                      label: t('admin.views.analytics.leads'),
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
                    <strong>{{ t('admin.views.analytics.conversionRateLabel') }}</strong> {{ leads.conversion_rate }}%
                  </div>
                  <div>
                    <strong>{{ t('admin.views.analytics.unansweredLeads') }}</strong> {{ leads.unanswered_count }}
                  </div>
                </div>
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.topVehiclesByLeads') }}</h3>
                <v-table>
                  <thead>
                    <tr>
                      <th>{{ t('admin.views.analytics.vehicle') }}</th>
                      <th>{{ t('admin.views.analytics.registration') }}</th>
                      <th>{{ t('admin.views.analytics.leads') }}</th>
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
          <span>{{ t('admin.views.analytics.userActivity') }}</span>
        </v-card-title>
          <v-card-text>
          <div v-if="loadingActivity" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="small" />
            </div>
          <div v-else-if="activity">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.loginActivity') }}</h3>
                <LineChart
                  v-if="activity.login_activity.length > 0"
                  :data="{
                    labels: activity.login_activity.map((a) => a.date),
                    datasets: [{
                      label: t('admin.views.analytics.logins'),
                      data: activity.login_activity.map((a) => a.count),
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.4,
                    }],
                  }"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">{{ t('admin.views.analytics.listingCreationTrends') }}</h3>
                <LineChart
                  v-if="activity.listing_creation_trends.length > 0"
                  :data="{
                    labels: activity.listing_creation_trends.map((a) => a.date),
                    datasets: [{
                      label: t('admin.views.analytics.listingsCreated'),
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

      <!-- Cohort & integrations -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="h-100">
            <v-card-title>{{ t('admin.views.analytics.cohortTitle') }}</v-card-title>
            <v-card-text>
              <v-table v-if="cohort?.cohorts?.length" density="compact">
                <thead>
                  <tr>
                    <th>{{ t('admin.views.analytics.cohortMonth') }}</th>
                    <th>{{ t('admin.views.analytics.signups') }}</th>
                    <th>{{ t('admin.views.analytics.stillActive') }}</th>
                    <th>{{ t('admin.views.analytics.retentionRate') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in cohort.cohorts" :key="row.cohort_month">
                    <td>{{ row.cohort_month }}</td>
                    <td>{{ row.signups }}</td>
                    <td>{{ row.still_active }}</td>
                    <td>{{ row.retention_rate }}%</td>
                  </tr>
                </tbody>
              </v-table>
              <div v-else class="text-medium-emphasis">{{ t('common.noData') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="h-100">
            <v-card-title>{{ t('admin.views.analytics.integrationsTitle') }}</v-card-title>
            <v-card-text v-if="integrations">
              <h4 class="text-subtitle-2 mb-2">{{ t('admin.views.analytics.paymentsSection') }}</h4>
              <div class="mb-2">{{ t('admin.views.analytics.paymentSuccessRate') }}: {{ integrations.payments.success_rate }}%</div>
              <div class="mb-4">{{ t('admin.views.analytics.paymentVolume') }}: {{ formatPrice(integrations.payments.volume_cents / 100) }}</div>
              <h4 class="text-subtitle-2 mb-2">{{ t('admin.views.analytics.aiSection') }}</h4>
              <div class="mb-2">{{ t('admin.views.analytics.aiRequests') }}: {{ integrations.ai.requests_succeeded + integrations.ai.requests_failed }}</div>
              <div>{{ t('admin.views.analytics.aiTokens') }}: {{ formatNumber(integrations.ai.tokens_used) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getAnalyticsOverview,
  getAnalyticsRevenue,
  getAnalyticsDealers,
  getAnalyticsVehicles,
  getAnalyticsLeads,
  getAnalyticsActivity,
  getAnalyticsFunnel,
  getAnalyticsAdsFunnel,
  getAnalyticsCohort,
  getAnalyticsIntegrations,
  getAnalyticsTrends,
  downloadAdminAnalyticsExport,
} from '@/api/admin.api'
import type {
  AnalyticsOverview,
  RevenueAnalytics,
  DealerPerformance,
  VehicleAnalytics,
  LeadAnalytics,
  UserActivityAnalytics,
  FunnelAnalytics,
  AdsFunnelAnalytics,
  CohortAnalytics,
  IntegrationsAnalytics,
  TrendAnalytics,
} from '@/models/analytics.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import DateRangeFilter, { type DateRange } from '@/components/analytics/DateRangeFilter.vue'
import MetricCard from '@/components/analytics/MetricCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { getLeadSourceName } from '@/utils/leadHelpers'
import PageHeader from '@/components/panel/PageHeader.vue'
import { getIntlLocale } from '@/utils/defaultLocale'

const { t } = useI18n()
const dateRange = ref<DateRange>('30d')
const comparePeriod = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const sectionErrors = ref<string[]>([])

const overview = ref<AnalyticsOverview | null>(null)
const revenue = ref<RevenueAnalytics | null>(null)
const dealers = ref<DealerPerformance | null>(null)
const vehicles = ref<VehicleAnalytics | null>(null)
const leads = ref<LeadAnalytics | null>(null)
const activity = ref<UserActivityAnalytics | null>(null)
const funnel = ref<FunnelAnalytics | null>(null)
const adsFunnel = ref<AdsFunnelAnalytics | null>(null)
const adsFunnelSource = ref<'meta' | 'other' | 'all'>('meta')
const cohort = ref<CohortAnalytics | null>(null)
const integrations = ref<IntegrationsAnalytics | null>(null)
const trends = ref<TrendAnalytics | null>(null)

const loadingRevenue = ref(false)
const loadingDealers = ref(false)
const loadingVehicles = ref(false)
const loadingLeads = ref(false)
const loadingActivity = ref(false)

const isAnyLoading = computed(
  () =>
    loading.value ||
    loadingRevenue.value ||
    loadingDealers.value ||
    loadingVehicles.value ||
    loadingLeads.value ||
    loadingActivity.value
)

const recordSectionError = (section: string, err: unknown) => {
  const message = (err as ApiErrorModel).message || section
  sectionErrors.value.push(`${section}: ${message}`)
}

const formatBillingCycle = (cycle: string) => {
  if (cycle === 'monthly') return t('admin.views.analytics.billingMonthly')
  if (cycle === 'yearly') return t('admin.views.analytics.billingYearly')
  return cycle
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatNumber = (value: number) => value.toLocaleString(getIntlLocale())

const loadOverview = async () => {
  try {
    error.value = null
    overview.value = await getAnalyticsOverview(dateRange.value)
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.analytics.failedLoadOverview')
  }
}

const loadRevenue = async () => {
  try {
    loadingRevenue.value = true
    revenue.value = await getAnalyticsRevenue(dateRange.value)
  } catch (err) {
    recordSectionError(t('admin.views.analytics.revenueAnalytics'), err)
  } finally {
    loadingRevenue.value = false
  }
}

const loadDealers = async () => {
  try {
    loadingDealers.value = true
    dealers.value = await getAnalyticsDealers(dateRange.value)
  } catch (err) {
    recordSectionError(t('admin.views.analytics.dealerPerformance'), err)
  } finally {
    loadingDealers.value = false
  }
}

const loadVehicles = async () => {
  try {
    loadingVehicles.value = true
    vehicles.value = await getAnalyticsVehicles(dateRange.value)
  } catch (err) {
    recordSectionError(t('admin.views.analytics.vehicleAnalytics'), err)
  } finally {
    loadingVehicles.value = false
  }
}

const loadLeads = async () => {
  try {
    loadingLeads.value = true
    leads.value = await getAnalyticsLeads(dateRange.value)
  } catch (err) {
    recordSectionError(t('admin.views.analytics.leadAnalytics'), err)
  } finally {
    loadingLeads.value = false
  }
}

const loadActivity = async () => {
  try {
    loadingActivity.value = true
    activity.value = await getAnalyticsActivity(dateRange.value)
  } catch (err) {
    recordSectionError(t('admin.views.analytics.userActivity'), err)
  } finally {
    loadingActivity.value = false
  }
}

const loadFunnel = async () => {
  try {
    funnel.value = (await getAnalyticsFunnel(dateRange.value, comparePeriod.value)) as FunnelAnalytics
  } catch (err) {
    recordSectionError(t('admin.views.analytics.funnelTitle'), err)
  }
}

const adsDropoff = (from: number, to: number) => (from > 0 ? Math.round((1 - to / from) * 10000) / 100 : 0)

const loadAdsFunnel = async () => {
  try {
    adsFunnel.value = await getAnalyticsAdsFunnel(dateRange.value, adsFunnelSource.value)
  } catch (err) {
    recordSectionError(t('admin.views.analytics.adsFunnelTitle'), err)
  }
}

const loadCohort = async () => {
  try {
    cohort.value = (await getAnalyticsCohort()) as CohortAnalytics
  } catch (err) {
    recordSectionError(t('admin.views.analytics.cohortTitle'), err)
  }
}

const loadIntegrations = async () => {
  try {
    integrations.value = (await getAnalyticsIntegrations(dateRange.value)) as IntegrationsAnalytics
  } catch (err) {
    recordSectionError(t('admin.views.analytics.integrationsTitle'), err)
  }
}

const loadTrends = async () => {
  try {
    trends.value = (await getAnalyticsTrends(dateRange.value)) as TrendAnalytics
  } catch (err) {
    recordSectionError(t('admin.views.analytics.trendsTitle'), err)
  }
}

async function exportReport(report: string) {
  await downloadAdminAnalyticsExport(report, dateRange.value)
}

const loadAllAnalytics = async () => {
  sectionErrors.value = []
  loading.value = true
  await Promise.all([
    loadOverview(),
    loadFunnel(),
    loadAdsFunnel(),
    loadCohort(),
    loadIntegrations(),
    loadTrends(),
    loadRevenue(),
    loadDealers(),
    loadVehicles(),
    loadLeads(),
    loadActivity(),
  ])
  loading.value = false
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