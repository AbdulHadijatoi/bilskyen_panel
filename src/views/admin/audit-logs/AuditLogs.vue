<template>
  <div class="audit-logs-management">
    <!-- Header -->
    <div class="header-section mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Audit Logs</h1>
        <p class="text-body-2 text-medium-emphasis">
          View and filter audit logs for all system activities. Track all changes and actions across the platform.
        </p>
      </div>
    </div>

    <!-- Two Row Layout -->
    <div class="audit-logs-layout">
      <!-- Top Row: Filters -->
      <div class="filters-row">
        <v-card variant="flat" :style="{ border: '1px solid #f5f5f5' }">
          <v-card-text class="pa-4">
            <div class="filters-grid">
              <!-- Search -->
              <div class="filter-item filter-search">
                <v-text-field
                  v-model="filters.search"
                  label="Search"
                  placeholder="Search logs..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  :style="{ border: '1px solid #f5f5f5' }"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Action Filter -->
              <div class="filter-item">
                <v-select
                  v-model="filters.action"
                  :items="actionOptions"
                  label="Action"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  :style="{ border: '1px solid #f5f5f5' }"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Target Type Filter -->
              <div class="filter-item">
                <v-select
                  v-model="filters.target_type"
                  :items="targetTypeOptions"
                  label="Target Type"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  :style="{ border: '1px solid #f5f5f5' }"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Severity Filter -->
              <div class="filter-item">
                <v-select
                  v-model="filters.severity"
                  :items="severityOptions"
                  label="Severity"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  :style="{ border: '1px solid #f5f5f5' }"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Status Filter -->
              <div class="filter-item">
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  label="Status"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  :style="{ border: '1px solid #f5f5f5' }"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Time Period -->
              <div class="filter-item">
                <v-select
                  v-model="filters.time_period"
                  :items="timePeriodOptions"
                  label="Time Period"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  :style="{ border: '1px solid #f5f5f5' }"
                  @update:model-value="handleTimePeriodChange"
                />
              </div>

              <!-- Clear Filters Button -->
              <div class="filter-item filter-button">
                <v-btn
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-filter-off"
                  :style="{ border: '1px solid #f5f5f5', height: '40px' }"
                  @click="clearFilters"
                >
                  Clear Filters
                </v-btn>
              </div>
            </div>

            <!-- Filter Summary Chips -->
            <div v-if="hasActiveFilters" class="mt-3 pt-3" style="border-top: 1px solid #f5f5f5;">
              <div class="d-flex flex-wrap gap-2 align-center">
                <span class="text-caption text-medium-emphasis">Active filters:</span>
                <v-chip
                  v-for="(value, key) in activeFilters"
                  :key="key"
                  size="x-small"
                  variant="flat"
                  closable
                  @click:close="removeFilter(key)"
                  :style="{ backgroundColor: '#f5f5f5', color: 'rgba(0, 0, 0, 0.6)' }"
                >
                  {{ getFilterLabel(key) }}: {{ value }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Bottom Row: Audit Logs Table -->
      <div class="audit-logs-row">
        <!-- Audit Logs Table -->
        <v-card variant="flat" :style="{ border: '1px solid #f5f5f5' }">
          <v-card-text class="pa-4">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div v-else-if="error" class="text-center py-8">
              <v-alert type="error" variant="tonal" density="compact">
                {{ error }}
              </v-alert>
            </div>

            <div v-else-if="auditLogs.docs.length === 0" class="text-center py-12">
              <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-file-document-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis mb-1">No audit logs found</p>
              <p class="text-caption text-medium-emphasis">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'No audit logs available' }}
              </p>
            </div>

            <v-data-table
              v-else
              :headers="headers"
              :items="auditLogs.docs"
              :items-per-page="auditLogs.limit"
              :page="auditLogs.page"
              density="compact"
              class="audit-logs-table"
              @update:page="handlePageChange"
              @update:sort-by="handleSortChange"
            >
              <template #item.action="{ item }">
                <v-chip
                  size="x-small"
                  variant="flat"
                  :color="getActionColor(item.action)"
                  :style="{ backgroundColor: getActionColor(item.action) + '20' }"
                >
                  {{ item.action }}
                </v-chip>
              </template>

              <template #item.severity="{ item }">
                <v-chip
                  v-if="item.severity"
                  size="x-small"
                  variant="flat"
                  :color="getSeverityColor(item.severity)"
                  :style="{ backgroundColor: getSeverityColor(item.severity) + '20' }"
                >
                  {{ item.severity }}
                </v-chip>
                <span v-else class="text-caption text-medium-emphasis">-</span>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  v-if="item.status"
                  size="x-small"
                  variant="flat"
                  :color="getStatusColor(item.status)"
                  :style="{ backgroundColor: getStatusColor(item.status) + '20' }"
                >
                  {{ item.status }}
                </v-chip>
                <span v-else class="text-caption text-medium-emphasis">-</span>
              </template>

              <template #item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>

              <template #item.description="{ item }">
                <span class="text-caption" :title="item.description">
                  {{ truncateText(item.description || '-', 50) }}
                </span>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-eye"
                  density="compact"
                  @click="openDetailDialog(item.id)"
                />
              </template>
            </v-data-table>

            <!-- Pagination -->
            <div v-if="auditLogs.totalPages && auditLogs.totalPages > 1" class="d-flex justify-center mt-4">
              <v-pagination
                v-model="currentPage"
                :length="auditLogs.totalPages"
                :total-visible="7"
                density="compact"
                @update:model-value="handlePageChange"
              />
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Detail Dialog -->
    <v-dialog v-model="detailDialog.show" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Audit Log Details</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailDialog.show = false" />
        </v-card-title>
        <v-divider />
        <v-card-text v-if="detailDialog.loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
        </v-card-text>
        <v-card-text v-else-if="detailDialog.error" class="text-center py-8">
          <v-alert type="error" variant="tonal" density="compact">
            {{ detailDialog.error }}
          </v-alert>
        </v-card-text>
        <v-card-text v-else-if="detailDialog.log" class="pa-6">
          <div class="detail-section">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Basic Information</h3>
            <v-row>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">ID:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.id }}</span>
                </div>
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Action:</span>
                  <v-chip
                    size="small"
                    variant="flat"
                    :color="getActionColor(detailDialog.log.action)"
                    :style="{ backgroundColor: getActionColor(detailDialog.log.action) + '20' }"
                    class="ml-2"
                  >
                    {{ detailDialog.log.action }}
                  </v-chip>
                </div>
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Target Type:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.target_type }}</span>
                </div>
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Target ID:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.target_id }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Actor Type:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.actor_type }}</span>
                </div>
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Actor ID:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.actor_id }}</span>
                </div>
                <div class="detail-item mb-3" v-if="detailDialog.log.dealer_id">
                  <span class="text-caption text-medium-emphasis">Dealer ID:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.dealer_id }}</span>
                </div>
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Created At:</span>
                  <span class="text-body-2 ml-2">{{ formatDate(detailDialog.log.created_at) }}</span>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4" />

          <div class="detail-section">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Status & Severity</h3>
            <v-row>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Status:</span>
                  <v-chip
                    v-if="detailDialog.log.status"
                    size="small"
                    variant="flat"
                    :color="getStatusColor(detailDialog.log.status)"
                    :style="{ backgroundColor: getStatusColor(detailDialog.log.status) + '20' }"
                    class="ml-2"
                  >
                    {{ detailDialog.log.status }}
                  </v-chip>
                  <span v-else class="text-body-2 ml-2">-</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Severity:</span>
                  <v-chip
                    v-if="detailDialog.log.severity"
                    size="small"
                    variant="flat"
                    :color="getSeverityColor(detailDialog.log.severity)"
                    :style="{ backgroundColor: getSeverityColor(detailDialog.log.severity) + '20' }"
                    class="ml-2"
                  >
                    {{ detailDialog.log.severity }}
                  </v-chip>
                  <span v-else class="text-body-2 ml-2">-</span>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4" v-if="detailDialog.log.description" />

          <div class="detail-section" v-if="detailDialog.log.description">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Description</h3>
            <p class="text-body-2">{{ detailDialog.log.description }}</p>
          </div>

          <v-divider class="my-4" v-if="detailDialog.log.metadata || detailDialog.log.tags" />

          <div class="detail-section" v-if="detailDialog.log.metadata || detailDialog.log.tags">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Additional Information</h3>
            <div v-if="detailDialog.log.tags" class="mb-3">
              <span class="text-caption text-medium-emphasis">Tags:</span>
              <span class="text-body-2 ml-2">{{ detailDialog.log.tags }}</span>
            </div>
            <div v-if="detailDialog.log.metadata">
              <span class="text-caption text-medium-emphasis">Metadata:</span>
              <pre class="text-body-2 mt-2 pa-3" style="background-color: #f5f5f5; border-radius: 4px; overflow-x: auto;">{{ JSON.stringify(detailDialog.log.metadata, null, 2) }}</pre>
            </div>
          </div>

          <v-divider class="my-4" v-if="detailDialog.log.request_method || detailDialog.log.request_url || detailDialog.log.ip_address" />

          <div class="detail-section" v-if="detailDialog.log.request_method || detailDialog.log.request_url || detailDialog.log.ip_address">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Request Information</h3>
            <v-row>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3" v-if="detailDialog.log.request_method">
                  <span class="text-caption text-medium-emphasis">Method:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.request_method }}</span>
                </div>
                <div class="detail-item mb-3" v-if="detailDialog.log.ip_address">
                  <span class="text-caption text-medium-emphasis">IP Address:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.ip_address }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3" v-if="detailDialog.log.user_agent">
                  <span class="text-caption text-medium-emphasis">User Agent:</span>
                  <span class="text-body-2 ml-2" style="word-break: break-all;">{{ detailDialog.log.user_agent }}</span>
                </div>
                <div class="detail-item mb-3" v-if="detailDialog.log.duration_ms">
                  <span class="text-caption text-medium-emphasis">Duration:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.duration_ms }} ms</span>
                </div>
              </v-col>
            </v-row>
            <div class="detail-item mb-3" v-if="detailDialog.log.request_url">
              <span class="text-caption text-medium-emphasis">URL:</span>
              <span class="text-body-2 ml-2" style="word-break: break-all;">{{ detailDialog.log.request_url }}</span>
            </div>
          </div>

          <v-divider class="my-4" v-if="detailDialog.log.error_message" />

          <div class="detail-section" v-if="detailDialog.log.error_message">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 text-error">Error Information</h3>
            <v-alert type="error" variant="tonal" density="compact">
              {{ detailDialog.log.error_message }}
            </v-alert>
          </div>

          <v-divider class="my-4" v-if="detailDialog.log.related_target_type" />

          <div class="detail-section" v-if="detailDialog.log.related_target_type">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Related Target</h3>
            <v-row>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Related Target Type:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.related_target_type }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="detail-item mb-3">
                  <span class="text-caption text-medium-emphasis">Related Target ID:</span>
                  <span class="text-body-2 ml-2">{{ detailDialog.log.related_target_id }}</span>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailDialog.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" size="small" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getAuditLogs, getAuditLog, type AuditLogModel } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'

// State
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})
const loading = ref(false)
const error = ref<string | null>(null)
const auditLogs = ref<PaginationModel<AuditLogModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
  totalPages: 0,
  totalDocs: 0,
})
const currentPage = ref(1)
const sortBy = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

const filters = ref({
  search: '',
  action: null as string | null,
  target_type: null as string | null,
  severity: null as string | null,
  status: null as string | null,
  time_period: null as string | null,
  date_from: '',
  date_to: '',
})

const detailDialog = ref({
  show: false,
  loading: false,
  error: null as string | null,
  log: null as AuditLogModel | null,
})


// Filter Options
const actionOptions = [
  'create',
  'update',
  'delete',
  'view',
  'assign',
  'manage',
  'status',
  'media',
  'messages',
]

const targetTypeOptions = [
  'Vehicle',
  'Lead',
  'User',
  'Dealer',
  'Subscription',
  'Staff',
  'Enquiry',
  'Plan',
  'Feature',
]

const severityOptions = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' },
  { title: 'Critical', value: 'critical' },
]

const statusOptions = [
  { title: 'Success', value: 'success' },
  { title: 'Failed', value: 'failed' },
  { title: 'Pending', value: 'pending' },
]

const timePeriodOptions = [
  { title: 'Last 1 Day', value: '1_day' },
  { title: 'Last 2 Days', value: '2_days' },
  { title: 'Last 3 Days', value: '3_days' },
  { title: 'Last 4 Days', value: '4_days' },
  { title: 'Last 5 Days', value: '5_days' },
  { title: 'Last 6 Days', value: '6_days' },
  { title: 'Last 1 Week', value: '1_week' },
  { title: 'Last 2 Weeks', value: '2_weeks' },
  { title: 'Last 3 Weeks', value: '3_weeks' },
  { title: 'Last 1 Month', value: '1_month' },
  { title: 'Last 2 Months', value: '2_months' },
  { title: 'Last 3 Months', value: '3_months' },
  { title: 'Last 6 Months', value: '6_months' },
  { title: 'Last 1 Year', value: '1_year' },
]

// Table Headers
const headers = [
  { title: 'ID', key: 'id', sortable: false, width: '80px' },
  { title: 'Action', key: 'action', sortable: true },
  { title: 'Target Type', key: 'target_type', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Actor Type', key: 'actor_type', sortable: false },
  { title: 'Severity', key: 'severity', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Created At', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: '100px' },
]

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== null && value !== '') || 
         (filters.value.date_from && filters.value.date_to)
})

const activeFilters = computed(() => {
  const active: Record<string, string> = {}
  if (filters.value.search) active.search = filters.value.search
  if (filters.value.action) active.action = filters.value.action
  if (filters.value.target_type) active.target_type = filters.value.target_type
  if (filters.value.severity) active.severity = filters.value.severity
  if (filters.value.status) active.status = filters.value.status
  if (filters.value.time_period) {
    const option = timePeriodOptions.find(opt => opt.value === filters.value.time_period)
    active.time_period = option?.title || filters.value.time_period
  }
  return active
})

// Methods
const loadAuditLogs = async () => {
  try {
    loading.value = true
    error.value = null

    const params: any = {
      page: currentPage.value,
      limit: auditLogs.value.limit,
      sort: sortBy.value,
      order: sortOrder.value,
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.action) params.action = filters.value.action
    if (filters.value.target_type) params.target_type = filters.value.target_type
    if (filters.value.severity) params.severity = filters.value.severity
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.date_from) params.date_from = filters.value.date_from
    if (filters.value.date_to) params.date_to = filters.value.date_to

    const response = await getAuditLogs(params)
    auditLogs.value = response
  } catch (err: any) {
    console.error('Failed to load audit logs:', err)
    error.value = err.message || 'Failed to load audit logs'
    showSnackbar('Failed to load audit logs', 'error')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadAuditLogs()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadAuditLogs()
}

const handleSortChange = (options: any) => {
  if (options.length > 0) {
    sortBy.value = options[0].key
    sortOrder.value = options[0].order || 'desc'
    loadAuditLogs()
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    action: null,
    target_type: null,
    severity: null,
    status: null,
    time_period: null,
    date_from: '',
    date_to: '',
  }
  currentPage.value = 1
  loadAuditLogs()
}

const handleTimePeriodChange = (period: string | null) => {
  if (!period) {
    filters.value.date_from = ''
    filters.value.date_to = ''
    handleFilterChange()
    return
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today
  const dateTo = today.toISOString().split('T')[0]

  let dateFrom = new Date()

  // Parse the period value
  if (period.includes('_day') || period.includes('_days')) {
    const daysStr = period.split('_')[0]
    const days = daysStr ? parseInt(daysStr) : 0
    dateFrom.setDate(today.getDate() - days)
  } else if (period.includes('_week') || period.includes('_weeks')) {
    const weeksStr = period.split('_')[0]
    const weeks = weeksStr ? parseInt(weeksStr) : 0
    dateFrom.setDate(today.getDate() - (weeks * 7))
  } else if (period.includes('_month') || period.includes('_months')) {
    const monthsStr = period.split('_')[0]
    const months = monthsStr ? parseInt(monthsStr) : 0
    dateFrom.setMonth(today.getMonth() - months)
  } else if (period.includes('_year') || period.includes('_years')) {
    const yearsStr = period.split('_')[0]
    const years = yearsStr ? parseInt(yearsStr) : 0
    dateFrom.setFullYear(today.getFullYear() - years)
  }

  dateFrom.setHours(0, 0, 0, 0) // Start of day
  const dateFromStr = dateFrom.toISOString().split('T')[0] || ''
  const dateToStr = dateTo || ''

  filters.value.date_from = dateFromStr
  filters.value.date_to = dateToStr
  handleFilterChange()
}

const removeFilter = (key: string) => {
  if (key === 'search') {
    filters.value.search = ''
  } else if (key === 'action') {
    filters.value.action = null
  } else if (key === 'target_type') {
    filters.value.target_type = null
  } else if (key === 'severity') {
    filters.value.severity = null
  } else if (key === 'status') {
    filters.value.status = null
  } else if (key === 'time_period') {
    filters.value.time_period = null
    filters.value.date_from = ''
    filters.value.date_to = ''
    handleFilterChange()
    return
  }
  handleFilterChange()
}

const getFilterLabel = (key: string): string => {
  const labels: Record<string, string> = {
    search: 'Search',
    action: 'Action',
    target_type: 'Target Type',
    severity: 'Severity',
    status: 'Status',
    time_period: 'Time Period',
  }
  return labels[key] || key
}

const formatDate = (date?: string): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    create: 'success',
    update: 'info',
    delete: 'error',
    view: 'primary',
    assign: 'warning',
    manage: 'primary',
    status: 'info',
    media: 'primary',
    messages: 'primary',
  }
  return colors[action.toLowerCase()] || 'grey'
}

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    critical: 'error',
  }
  return colors[severity.toLowerCase()] || 'grey'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    success: 'success',
    failed: 'error',
    pending: 'warning',
  }
  return colors[status.toLowerCase()] || 'grey'
}

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

const openDetailDialog = async (id: number) => {
  detailDialog.value.show = true
  detailDialog.value.loading = true
  detailDialog.value.error = null
  detailDialog.value.log = null

  try {
    const log = await getAuditLog(id)
    detailDialog.value.log = log
  } catch (err: any) {
    console.error('Failed to load audit log details:', err)
    detailDialog.value.error = err.message || 'Failed to load audit log details'
    showSnackbar('Failed to load audit log details', 'error')
  } finally {
    detailDialog.value.loading = false
  }
}

// Lifecycle
onMounted(() => {
  loadAuditLogs()
})
</script>

<style scoped>
.audit-logs-management {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  padding: 0;
}

.audit-logs-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters-row {
  width: 100%;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
}

.filter-item {
  min-width: 0;
}

.filter-search {
  grid-column: span 2;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .filter-search {
    grid-column: span 1;
  }
}

.audit-logs-row {
  width: 100%;
}

:deep(.v-card) {
  box-shadow: none !important;
}

:deep(.v-text-field .v-field),
:deep(.v-select .v-field) {
  border: 1px solid #f5f5f5 !important;
}

:deep(.v-data-table) {
  box-shadow: none !important;
}

:deep(.v-data-table__thead) {
  background-color: #fafafa;
}

:deep(.v-data-table__tbody td) {
  font-size: 0.75rem !important;
  padding: 12px 16px !important;
}

:deep(.v-data-table__tbody tr) {
  border-bottom: 1px solid #f5f5f5;
}

:deep(.v-data-table__tbody tr:hover) {
  background-color: #fafafa;
}

:deep(.v-chip) {
  font-size: 0.6875rem !important;
  height: 20px !important;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}
</style>
