<template>
  <div class="panel-page enquiries-overview">
    <PageHeader
      :title="t('dealer.views.enquiries.title')"
      :subtitle="t('dealer.views.enquiries.subtitle')"
    >
      <template #actions>
        <button type="button" class="panel-btn panel-btn--outline panel-btn--sm" :disabled="loading" @click="loadEnquiries">
          <v-icon size="14">mdi-refresh</v-icon>
          {{ t('dealer.views.enquiries.refresh') }}
        </button>
      </template>
    </PageHeader>

    <v-row v-if="!loading && !error" class="mb-5">
      <v-col cols="6" sm="4" md="3">
        <OverviewStatCard :label="t('dealer.views.enquiries.total')" :value="pagination.total" icon="mdi-email-multiple" color="primary" />
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <OverviewStatCard :label="t('dealer.views.enquiries.new')" :value="newCount" icon="mdi-email-alert" color="info" value-tone="info" />
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <OverviewStatCard :label="t('dealer.views.enquiries.inProgress')" :value="inProgressCount" icon="mdi-clock-outline" color="warning" value-tone="warning" />
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <OverviewStatCard :label="t('dealer.views.enquiries.responded')" :value="respondedCount" icon="mdi-check-circle" color="success" value-tone="success" />
      </v-col>
    </v-row>

    <div class="panel-filters-card mb-4">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :placeholder="t('dealer.views.enquiries.searchPlaceholder')"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            @update:model-value="handleSearch"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('dealer.views.enquiries.status') }}</span>
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            @update:model-value="loadEnquiries"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('dealer.views.enquiries.type') }}</span>
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            @update:model-value="loadEnquiries"
          />
        </div>
        <div class="panel-filters-grid__actions panel-filters-grid__actions--trailing">
          <button type="button" class="panel-btn panel-btn--outline" :disabled="loading" @click="loadEnquiries">
            <v-icon size="16">mdi-refresh</v-icon>
            {{ t('dealer.views.enquiries.refresh') }}
          </button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="panel-active-filters">
        <span class="panel-active-filters__label">{{ t('admin.views.auditLogs.activeFilters') }}</span>
        <span v-if="filters.status" class="panel-filter-chip">
          {{ t('dealer.views.enquiries.status') }}: {{ getStatusLabel(filters.status) }}
          <button type="button" aria-label="Remove filter" @click="clearStatusFilter">
            <v-icon size="12">mdi-close</v-icon>
          </button>
        </span>
        <span v-if="filters.type" class="panel-filter-chip">
          {{ t('dealer.views.enquiries.type') }}: {{ getTypeLabel(filters.type) }}
          <button type="button" aria-label="Remove filter" @click="clearTypeFilter">
            <v-icon size="12">mdi-close</v-icon>
          </button>
        </span>
        <span v-if="searchQuery" class="panel-filter-chip">
          {{ t('common.search') }}: {{ searchQuery }}
          <button type="button" aria-label="Remove filter" @click="clearSearch">
            <v-icon size="12">mdi-close</v-icon>
          </button>
        </span>
      </div>
    </div>

    <div class="panel-table-card">
      <div class="panel-table-card__body">
        <div v-if="loading" class="panel-loading">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p>{{ t('dealer.views.enquiries.loadingEnquiries') }}</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>{{ t('dealer.views.enquiries.error') }}</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="enquiries.length === 0" class="panel-table-empty">
          <v-icon size="48" color="disabled">mdi-email-off</v-icon>
          <p>{{ t('dealer.views.enquiries.noEnquiriesFound') }}</p>
          <p class="panel-table-empty__hint">
            {{ hasActiveFilters ? t('dealer.views.enquiries.tryAdjustingFilters') : t('dealer.views.enquiries.noEnquiriesYet') }}
          </p>
          <button v-if="hasActiveFilters" type="button" class="panel-btn panel-btn--outline panel-btn--sm mt-2" @click="clearAllFilters">
            {{ t('dealer.views.enquiries.clearFilters') }}
          </button>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="enquiries"
          :items-per-page="pagination.limit"
          :page="pagination.page"
          :items-length="pagination.total"
          :loading="loading"
          density="comfortable"
          class="panel-data-table"
          elevation="0"
          item-value="id"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
            <template #item.subject="{ item }">
              <div class="d-flex align-center gap-2">
                <v-icon size="20" color="primary">mdi-email</v-icon>
                <div>
                  <div class="font-weight-medium text-body-2">{{ item.subject }}</div>
                  <div v-if="item.serialNo" class="text-caption text-medium-emphasis">
                    #{{ item.serialNo }}
                  </div>
                </div>
              </div>
            </template>
            
            <template #item.user="{ item }">
              <div v-if="item.user" class="d-flex align-center gap-2">
                <v-avatar size="32" color="primary">
                  <span class="text-caption">{{ getInitials(item.user.name) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ item.user.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.user.email || t('common.na') }}</div>
                  <div v-if="item.user.phone" class="text-caption text-medium-emphasis">
                    <v-icon size="12">mdi-phone</v-icon>
                    {{ item.user.phone }}
                  </div>
                </div>
              </div>
              <span v-else class="text-medium-emphasis">{{ t('common.na') }}</span>
            </template>

            <template #item.vehicle="{ item }">
              <div v-if="item.vehicle" class="d-flex align-center gap-2">
                <v-icon size="20" color="grey">mdi-car</v-icon>
                <div>
                  <div class="font-weight-medium text-body-2">
                    {{ item.vehicle.title || `Vehicle #${item.vehicle.id}` }}
                  </div>
                  <div v-if="item.vehicle.registration" class="text-caption text-medium-emphasis">
                    {{ item.vehicle.registration }}
                  </div>
                </div>
              </div>
              <span v-else class="text-medium-emphasis">{{ t('common.na') }}</span>
            </template>

            <template #item.type="{ item }">
              <v-chip
                size="small"
                variant="flat"
                :color="getTypeColor(item.type)"
                class="font-weight-medium"
              >
                <v-icon start size="16">{{ getTypeIcon(item.type) }}</v-icon>
                {{ item.type }}
              </v-chip>
            </template>

            <template #item.status="{ item }">
              <v-chip
                size="small"
                variant="flat"
                :color="getStatusColor(item.status)"
                class="font-weight-medium"
              >
                <v-icon start size="16">{{ getStatusIcon(item.status) }}</v-icon>
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.createdAt="{ item }">
              <div class="text-body-2">{{ formatDate(item.createdAt) }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatTimeAgo(item.createdAt) }}</div>
            </template>

            <template #item.actions="{ item }">
              <div class="panel-row-actions">
                <button
                  type="button"
                  class="panel-icon-btn panel-icon-btn--primary"
                  :title="t('dealer.views.enquiries.viewDetails')"
                  @click="viewEnquiry(item.id)"
                >
                  <v-icon size="16">mdi-eye-outline</v-icon>
                </button>
                <v-menu>
                  <template #activator="{ props }">
                    <button type="button" class="panel-icon-btn" v-bind="props" :title="t('dealer.views.enquiries.moreActions')">
                      <v-icon size="16">mdi-dots-vertical</v-icon>
                    </button>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="viewEnquiry(item.id)" prepend-icon="mdi-eye">
                      <v-list-item-title>{{ t('dealer.views.enquiries.viewDetails') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateEnquiryStatus(item)" prepend-icon="mdi-flag">
                      <v-list-item-title>{{ t('dealer.views.enquiries.changeStatus') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateEnquiryType(item)" prepend-icon="mdi-tag">
                      <v-list-item-title>{{ t('dealer.views.enquiries.changeType') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="item.vehicleId"
                      @click="viewVehicle(item.vehicleId)"
                      prepend-icon="mdi-car"
                    >
                      <v-list-item-title>{{ t('dealer.views.enquiries.viewVehicle') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
      </div>
    </div>

    <!-- Update Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-flag</v-icon>
          Update Enquiry Status
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
            :prepend-icon="getStatusIcon(selectedStatus)"
          />
          <v-alert
            v-if="selectedEnquiry"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            Updating status for: <strong>{{ selectedEnquiry.subject }}</strong>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="statusDialog = false" :disabled="updating">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateStatus"
            :loading="updating"
            prepend-icon="mdi-check"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update Type Dialog -->
    <v-dialog v-model="typeDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-tag</v-icon>
          Update Enquiry Type
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedType"
            :items="typeOptions"
            item-title="label"
            item-value="value"
            label="Type"
            variant="outlined"
            :prepend-icon="getTypeIcon(selectedType)"
          />
          <v-alert
            v-if="selectedEnquiry"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            Updating type for: <strong>{{ selectedEnquiry.subject }}</strong>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="typeDialog = false" :disabled="updating">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateType"
            :loading="updating"
            prepend-icon="mdi-check"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getEnquiries,
  updateEnquiryStatus as updateEnquiryStatusApi,
  updateEnquiryType as updateEnquiryTypeApi,
} from '@/api/dealer.api'
import type { EnquiryModel } from '@/models/enquiry.model'
import { EnquiryStatus, EnquiryType } from '@/models/enquiry.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import OverviewStatCard from '@/components/panel/OverviewStatCard.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const enquiries = ref<EnquiryModel[]>([])
const pagination = ref({
  page: 1,
  limit: 15,
  total: 0,
})
const updating = ref(false)
const searchQuery = ref<string>('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const filters = ref({
  status: null as string | null,
  type: null as string | null,
})

const statusDialog = ref(false)
const typeDialog = ref(false)
const selectedEnquiry = ref<EnquiryModel | null>(null)
const selectedStatus = ref<string>('')
const selectedType = ref<string>('')

const statusOptions = [
  { label: 'New', value: EnquiryStatus.NEW },
  { label: 'In Progress', value: EnquiryStatus.IN_PROGRESS },
  { label: 'Awaiting Customer', value: EnquiryStatus.AWAITING_CUSTOMER },
  { label: 'Responded', value: EnquiryStatus.RESPONDED },
  { label: 'Closed', value: EnquiryStatus.CLOSED },
  { label: 'Converted to Sale', value: EnquiryStatus.CONVERTED_TO_SALE },
  { label: 'Cancelled', value: EnquiryStatus.CANCELLED },
]

const typeOptions = [
  { label: 'General', value: EnquiryType.GENERAL },
  { label: 'Sales', value: EnquiryType.SALES },
  { label: 'Vehicle Information', value: EnquiryType.VEHICLE_INFORMATION },
  { label: 'Test Drive', value: EnquiryType.TEST_DRIVE },
  { label: 'Price Enquiry', value: EnquiryType.PRICE_ENQUIRY },
  { label: 'Financing', value: EnquiryType.FINANCING },
  { label: 'Insurance', value: EnquiryType.INSURANCE },
  { label: 'Trade-In', value: EnquiryType.TRADE_IN },
  { label: 'Availability', value: EnquiryType.AVAILABILITY },
  { label: 'Service', value: EnquiryType.SERVICE },
  { label: 'Parts', value: EnquiryType.PARTS },
  { label: 'Complaint', value: EnquiryType.COMPLAINT },
  { label: 'Feedback', value: EnquiryType.FEEDBACK },
  { label: 'Other', value: EnquiryType.OTHER },
]

const headers = computed(() => [
  { title: t('dealer.views.enquiries.subject'), key: 'subject', sortable: true, width: '25%' },
  { title: t('dealer.views.enquiries.customer'), key: 'user', sortable: false, width: '20%' },
  { title: t('dealer.views.enquiries.vehicle'), key: 'vehicle', sortable: false, width: '18%' },
  { title: t('dealer.views.enquiries.type'), key: 'type', sortable: true, width: '12%' },
  { title: t('dealer.views.enquiries.status'), key: 'status', sortable: true, width: '12%' },
  { title: t('dealer.views.enquiries.date'), key: 'createdAt', sortable: true, width: '10%' },
  { title: t('common.actions'), key: 'actions', sortable: false, align: 'end' as const, width: '3%' },
])

const hasActiveFilters = computed(() => {
  return !!(filters.value.status || filters.value.type || searchQuery.value)
})

const newCount = computed(() => {
  return enquiries.value.filter(e => e.status === EnquiryStatus.NEW).length
})

const inProgressCount = computed(() => {
  return enquiries.value.filter(e => e.status === EnquiryStatus.IN_PROGRESS).length
})

const respondedCount = computed(() => {
  return enquiries.value.filter(e => e.status === EnquiryStatus.RESPONDED).length
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    [EnquiryStatus.NEW]: 'blue',
    [EnquiryStatus.IN_PROGRESS]: 'orange',
    [EnquiryStatus.AWAITING_CUSTOMER]: 'yellow',
    [EnquiryStatus.RESPONDED]: 'green',
    [EnquiryStatus.CLOSED]: 'grey',
    [EnquiryStatus.CONVERTED_TO_SALE]: 'success',
    [EnquiryStatus.CANCELLED]: 'error',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    [EnquiryStatus.NEW]: 'mdi-email-alert',
    [EnquiryStatus.IN_PROGRESS]: 'mdi-clock-outline',
    [EnquiryStatus.AWAITING_CUSTOMER]: 'mdi-account-clock',
    [EnquiryStatus.RESPONDED]: 'mdi-check-circle',
    [EnquiryStatus.CLOSED]: 'mdi-close-circle',
    [EnquiryStatus.CONVERTED_TO_SALE]: 'mdi-check-circle',
    [EnquiryStatus.CANCELLED]: 'mdi-cancel',
  }
  return icons[status] || 'mdi-email'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    [EnquiryType.GENERAL]: 'grey',
    [EnquiryType.SALES]: 'primary',
    [EnquiryType.TEST_DRIVE]: 'blue',
    [EnquiryType.PRICE_ENQUIRY]: 'orange',
    [EnquiryType.FINANCING]: 'green',
    [EnquiryType.INSURANCE]: 'purple',
    [EnquiryType.SERVICE]: 'teal',
  }
  return colors[type] || 'grey'
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    [EnquiryType.GENERAL]: 'mdi-email',
    [EnquiryType.SALES]: 'mdi-cash',
    [EnquiryType.TEST_DRIVE]: 'mdi-car',
    [EnquiryType.PRICE_ENQUIRY]: 'mdi-cash',
    [EnquiryType.FINANCING]: 'mdi-bank',
    [EnquiryType.INSURANCE]: 'mdi-shield',
    [EnquiryType.SERVICE]: 'mdi-wrench',
    [EnquiryType.PARTS]: 'mdi-cog',
  }
  return icons[type] || 'mdi-tag'
}

const getStatusLabel = (status: string) => {
  return statusOptions.find(s => s.value === status)?.label || status
}

const getTypeLabel = (type: string) => {
  return typeOptions.find(t => t.value === type)?.label || type
}

const getInitials = (name?: string) => {
  if (!name) return '?'
  const parts = name.split(' ').filter(p => p.length > 0)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] || ''
    const last = parts[parts.length - 1]?.[0] || ''
    if (first && last) {
      return (first + last).toUpperCase()
    }
  }
  return name.substring(0, 2).toUpperCase()
}

const viewEnquiry = (enquiryId: number) => {
  router.push({ name: 'dealer.enquiries.detail', params: { id: enquiryId } })
}

const viewVehicle = (vehicleId: number) => {
  router.push({ name: 'dealer.vehicles.detail', params: { id: vehicleId } })
}

const updateEnquiryStatus = (enquiry: EnquiryModel) => {
  selectedEnquiry.value = enquiry
  selectedStatus.value = enquiry.status
  statusDialog.value = true
}

const updateEnquiryType = (enquiry: EnquiryModel) => {
  selectedEnquiry.value = enquiry
  selectedType.value = enquiry.type
  typeDialog.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedEnquiry.value) return

  try {
    updating.value = true
    await updateEnquiryStatusApi(selectedEnquiry.value.id, { status: selectedStatus.value })
    await loadEnquiries()
    statusDialog.value = false
    selectedEnquiry.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.enquiries.failedUpdateStatus')
  } finally {
    updating.value = false
  }
}

const handleUpdateType = async () => {
  if (!selectedEnquiry.value) return

  try {
    updating.value = true
    await updateEnquiryTypeApi(selectedEnquiry.value.id, { type: selectedType.value })
    await loadEnquiries()
    typeDialog.value = false
    selectedEnquiry.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.enquiries.failedUpdateType')
  } finally {
    updating.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadEnquiries()
}

const handleItemsPerPageChange = (itemsPerPage: number) => {
  pagination.value.limit = itemsPerPage
  pagination.value.page = 1
  loadEnquiries()
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadEnquiries()
  }, 500)
}

const clearStatusFilter = () => {
  filters.value.status = null
  loadEnquiries()
}

const clearTypeFilter = () => {
  filters.value.type = null
  loadEnquiries()
}

const clearSearch = () => {
  searchQuery.value = ''
  loadEnquiries()
}

const clearAllFilters = () => {
  filters.value.status = null
  filters.value.type = null
  searchQuery.value = ''
  loadEnquiries()
}

const loadEnquiries = async () => {
  try {
    loading.value = true
    error.value = null
    const params: PaginationParams & { status?: string; type?: string; search?: string } = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    if (filters.value.status) {
      params.status = filters.value.status
    }
    if (filters.value.type) {
      params.type = filters.value.type
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const response = await getEnquiries(params)
    enquiries.value = response.docs
    pagination.value.total = response.totalDocs || 0
  } catch (err) {
    const apiError = err as ApiErrorModel
    error.value = apiError?.message || t('dealer.views.enquiries.failedLoadEnquiries')
  } finally {
    loading.value = false
  }
}

const formatDate = (date?: string) => {
  if (!date) return t('common.na')
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTimeAgo = (date?: string) => {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return t('common.justNow')
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

onMounted(() => {
  loadEnquiries()
})
</script>
