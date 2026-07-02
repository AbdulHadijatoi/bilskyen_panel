<template>
  <div class="panel-page audit-logs-management">
    <!-- Header -->
    <PageHeader :title="t('dealer.views.auditLogs.title')" :subtitle="t('dealer.views.auditLogs.subtitle')" />

    <div class="panel-filters-card">
      <div class="panel-filters-grid panel-filters-grid--audit">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('admin.views.auditLogs.search') }}</span>
          <v-text-field
            v-model="filters.search"
            :placeholder="t('admin.views.auditLogs.searchPlaceholder')"
            variant="outlined"
            density="comfortable"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.auditLogs.action') }}</span>
          <v-select
            v-model="filters.action"
            :items="actionOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.auditLogs.targetType') }}</span>
          <v-select
            v-model="filters.target_type"
            :items="targetTypeOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.auditLogs.severity') }}</span>
          <v-select
            v-model="filters.severity"
            :items="severityOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('common.status') }}</span>
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.auditLogs.timePeriod') }}</span>
          <v-select
            v-model="filters.time_period"
            :items="timePeriodOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            @update:model-value="handleTimePeriodChange"
          />
        </div>
        <div class="panel-filters-grid__actions">
          <button type="button" class="panel-btn panel-btn--outline" @click="clearFilters">
            <v-icon size="16">mdi-filter-off</v-icon>
            {{ t('dealer.views.auditLogs.clearFilters') }}
          </button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="panel-active-filters">
        <span class="panel-active-filters__label">{{ t('admin.views.auditLogs.activeFilters') }}</span>
        <span
          v-for="(value, key) in activeFilters"
          :key="key"
          class="panel-filter-chip"
        >
          {{ getFilterLabel(key) }}: {{ value }}
          <button type="button" aria-label="Remove filter" @click="removeFilter(key)">
            <v-icon size="12">mdi-close</v-icon>
          </button>
        </span>
      </div>
    </div>

    <div class="panel-table-card">
      <div class="panel-table-card__body">
        <div v-if="loading" class="panel-loading">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>{{ error }}</v-alert>
        </div>

        <div v-else-if="auditLogs.docs.length === 0" class="panel-table-empty">
          <v-icon size="48" color="disabled">mdi-file-document-outline</v-icon>
          <p>{{ t('dealer.views.auditLogs.noLogsFound') }}</p>
          <p class="panel-table-empty__hint">
            {{ hasActiveFilters ? t('dealer.views.auditLogs.tryAdjustingFilters') : t('dealer.views.auditLogs.noLogsAvailable') }}
          </p>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="auditLogs.docs"
          :items-per-page="auditLogs.limit"
          :items-length="auditLogs.totalDocs || 0"
          :page="currentPage"
          density="comfortable"
          class="panel-data-table"
          elevation="0"
          @update:page="handlePageChange"
          @update:sort-by="handleSortChange"
        >
          <template #item.action="{ item }">
            <span class="panel-status-chip" :class="getActionChipClass(item.action)">
              {{ item.action }}
            </span>
          </template>

          <template #item.severity="{ item }">
            <span v-if="item.severity" class="panel-status-chip" :class="getSeverityChipClass(item.severity)">
              {{ item.severity }}
            </span>
            <span v-else class="panel-id-cell">—</span>
          </template>

          <template #item.status="{ item }">
            <span v-if="item.status" class="panel-status-chip" :class="getStatusChipClass(item.status)">
              {{ item.status }}
            </span>
            <span v-else class="panel-id-cell">—</span>
          </template>

          <template #item.created_at="{ item }">
            <span class="panel-id-cell">{{ formatDate(item.created_at) }}</span>
          </template>

          <template #item.description="{ item }">
            <span class="panel-vehicle-cell__subtitle text-truncate d-inline-block" style="max-width: 240px" :title="item.description || undefined">
              {{ truncateText(item.description || '—', 50) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="panel-row-actions">
              <button
                type="button"
                class="panel-icon-btn panel-icon-btn--primary"
                :title="t('common.view')"
                @click="openDetailDialog(item.id)"
              >
                <v-icon size="16">mdi-eye-outline</v-icon>
              </button>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- Audit Log Detail Dialog -->
    <v-dialog v-model="detailDialog.show" max-width="640" scrollable>
      <v-card class="panel-detail-dialog" variant="flat">
        <div class="panel-detail-dialog__header">
          <h2 class="panel-detail-dialog__title">
            <v-icon size="20" color="primary">mdi-file-document-outline</v-icon>
            {{ t('dealer.views.auditLogs.auditLogDetails') }}
          </h2>
          <button
            type="button"
            class="panel-icon-btn"
            :aria-label="t('dealer.views.auditLogs.close')"
            @click="detailDialog.show = false"
          >
            <v-icon size="16">mdi-close</v-icon>
          </button>
        </div>

        <div v-if="detailDialog.loading" class="panel-detail-dialog__body">
          <div class="panel-detail-dialog__loading">
            <v-progress-circular indeterminate color="primary" size="40" />
            <span>{{ t('common.loading') }}</span>
          </div>
        </div>

        <div v-else-if="detailDialog.error" class="panel-detail-dialog__body">
          <div class="panel-detail-dialog__error">
            <v-icon color="error" size="40">mdi-alert-circle-outline</v-icon>
            <span>{{ detailDialog.error }}</span>
          </div>
        </div>

        <div v-else-if="detailDialog.log" class="panel-detail-dialog__body">
          <div class="panel-detail-dialog__summary">
            <span class="panel-status-chip" :class="getActionChipClass(detailDialog.log.action)">
              {{ detailDialog.log.action }}
            </span>
            <span
              v-if="detailDialog.log.status"
              class="panel-status-chip"
              :class="getStatusChipClass(detailDialog.log.status)"
            >
              {{ detailDialog.log.status }}
            </span>
            <span
              v-if="detailDialog.log.severity"
              class="panel-status-chip"
              :class="getSeverityChipClass(detailDialog.log.severity)"
            >
              {{ detailDialog.log.severity }}
            </span>
            <span class="panel-detail-dialog__summary-meta">
              {{ formatDetailDate(detailDialog.log.created_at) }}
            </span>
          </div>

          <div v-if="detailDialog.log.description" class="panel-detail-dialog__desc">
            <span class="panel-detail-dialog__desc-label">{{ t('admin.views.auditLogs.description') }}</span>
            <p class="panel-detail-dialog__desc-text">{{ detailDialog.log.description }}</p>
          </div>

          <p class="panel-detail-dialog__section-title">{{ t('admin.views.auditLogs.basicInfo') }}</p>
          <div class="panel-detail-dialog__grid">
            <div class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('dealer.views.auditLogs.logId') }}</span>
              <span class="panel-detail-field__value">#{{ detailDialog.log.id }}</span>
            </div>
            <div class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.createdAt') }}</span>
              <span class="panel-detail-field__value">{{ formatDetailDate(detailDialog.log.created_at) }}</span>
            </div>
            <div class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.action') }}</span>
              <span class="panel-detail-field__value text-capitalize">{{ detailDialog.log.action }}</span>
            </div>
            <div class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('dealer.views.auditLogs.performedBy') }}</span>
              <span class="panel-detail-field__value">{{ formatActorType(detailDialog.log.actor_type) }}</span>
            </div>
            <div class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.targetType') }}</span>
              <span class="panel-detail-field__value">{{ detailDialog.log.target_type }}</span>
            </div>
            <div class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.targetId') }}</span>
              <span class="panel-detail-field__value">#{{ detailDialog.log.target_id }}</span>
            </div>
            <div v-if="detailDialog.log.status" class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('common.status') }}</span>
              <span class="panel-detail-field__value text-capitalize">{{ detailDialog.log.status }}</span>
            </div>
            <div v-if="detailDialog.log.severity" class="panel-detail-field">
              <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.severity') }}</span>
              <span class="panel-detail-field__value text-capitalize">{{ detailDialog.log.severity }}</span>
            </div>
            <template v-if="detailDialog.log.related_target_type">
              <div class="panel-detail-field">
                <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.relatedTargetType') }}</span>
                <span class="panel-detail-field__value">{{ detailDialog.log.related_target_type }}</span>
              </div>
              <div class="panel-detail-field">
                <span class="panel-detail-field__label">{{ t('admin.views.auditLogs.relatedTargetId') }}</span>
                <span class="panel-detail-field__value">#{{ detailDialog.log.related_target_id }}</span>
              </div>
            </template>
          </div>

          <div v-if="detailDialog.log.error_message" class="panel-detail-dialog__error-box">
            <span class="panel-detail-dialog__desc-label">{{ t('admin.views.auditLogs.errorInfo') }}</span>
            <p class="panel-detail-dialog__desc-text mb-0">{{ detailDialog.log.error_message }}</p>
          </div>
        </div>

        <div class="panel-detail-dialog__footer">
          <button type="button" class="panel-btn panel-btn--outline" @click="detailDialog.show = false">
            {{ t('dealer.views.auditLogs.close') }}
          </button>
        </div>
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
        <v-btn variant="text" size="small" @click="snackbar.show = false">{{ t('dealer.views.auditLogs.close') }}</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuditLogs, getAuditLog, type DealerAuditLogModel } from '@/api/dealer.api'
import type { PaginationModel } from '@/models/pagination.model'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()

// State
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})
const loading = ref(false)
const error = ref<string | null>(null)
const auditLogs = ref<PaginationModel<DealerAuditLogModel>>({
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

// Detail Dialog State
const detailDialog = ref({
  show: false,
  loading: false,
  error: null as string | null,
  log: null as DealerAuditLogModel | null,
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
  { title: 'Actions', key: 'actions', sortable: false, width: '100px', align: 'center' as const },
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
    error.value = err.message || t('dealer.views.auditLogs.failedLoadLogs')
    showSnackbar(t('dealer.views.auditLogs.failedLoadLogs'), 'error')
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

  const dateFrom = new Date()

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
  if (!date) return t('common.na')
  return new Date(date).toLocaleString()
}

const formatDetailDate = (date?: string): string => {
  if (!date) return t('common.na')
  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const formatActorType = (actorType?: string): string => {
  if (!actorType) return t('common.na')
  const normalized = actorType.includes('\\') ? actorType.split('\\').pop()! : actorType
  return normalized.replace(/_/g, ' ')
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
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
    detailDialog.value.error = err.message || t('dealer.views.auditLogs.failedLoadDetails')
    showSnackbar(t('dealer.views.auditLogs.failedLoadDetails'), 'error')
  } finally {
    detailDialog.value.loading = false
  }
}

// Lifecycle
onMounted(() => {
  loadAuditLogs()
})

const getActionChipClass = (action: string): string => {
  const key = action.toLowerCase()
  if (key === 'create') return 'panel-status-chip--success'
  if (key === 'delete') return 'panel-status-chip--warning'
  if (key === 'update' || key === 'status') return 'panel-status-chip--info'
  return 'panel-status-chip--neutral'
}

const getSeverityChipClass = (severity: string): string => {
  const key = severity.toLowerCase()
  if (key === 'low') return 'panel-status-chip--success'
  if (key === 'medium') return 'panel-status-chip--warning'
  return 'panel-status-chip--warning'
}

const getStatusChipClass = (status: string): string => {
  const key = status.toLowerCase()
  if (key === 'success') return 'panel-status-chip--success'
  if (key === 'failed') return 'panel-status-chip--warning'
  return 'panel-status-chip--neutral'
}
</script>
