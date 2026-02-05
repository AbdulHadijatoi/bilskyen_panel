<template>
  <div class="enquiries-overview">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Customer Enquiries</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage and respond to customer enquiries for your vehicles
          </p>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            icon
            variant="outlined"
            size="small"
            @click="loadEnquiries"
            :loading="loading"
            title="Refresh"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6" v-if="!loading && !error">
      <v-col cols="6" sm="4" md="3">
        <v-card variant="flat" elevation="0" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label text-caption">Total</div>
                <div class="stat-value text-h5 font-weight-bold">{{ pagination.total }}</div>
              </div>
              <v-icon size="32" color="primary" class="stat-icon">mdi-email-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card variant="flat" elevation="0" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label text-caption">New</div>
                <div class="stat-value text-h5 font-weight-bold text-blue">{{ newCount }}</div>
              </div>
              <v-icon size="32" color="blue" class="stat-icon">mdi-email-alert</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card variant="flat" elevation="0" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label text-caption">In Progress</div>
                <div class="stat-value text-h5 font-weight-bold text-orange">{{ inProgressCount }}</div>
              </div>
              <v-icon size="32" color="orange" class="stat-icon">mdi-clock-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card variant="flat" elevation="0" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label text-caption">Responded</div>
                <div class="stat-value text-h5 font-weight-bold text-success">{{ respondedCount }}</div>
              </div>
              <v-icon size="32" color="success" class="stat-icon">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card
      variant="outlined"
      class="mb-4"
      :style="{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }"
    >
      <v-card-text class="pa-4">
        <div class="d-flex flex-column flex-md-row gap-4 align-start">
          <!-- Search -->
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search enquiries..."
            variant="outlined"
            density="compact"
            clearable
            hide-details
            style="flex: 1; min-width: 250px;"
            @update:model-value="handleSearch"
            @keyup.enter="handleSearch"
          />

          <!-- Status Filter -->
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-filter"
            hide-details
            style="min-width: 180px;"
            @update:model-value="loadEnquiries"
          />

          <!-- Type Filter -->
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            item-title="label"
            item-value="value"
            label="Type"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-tag"
            hide-details
            style="min-width: 180px;"
            @update:model-value="loadEnquiries"
          />
        </div>

        <!-- Active Filters Chips -->
        <div v-if="hasActiveFilters" class="d-flex flex-wrap gap-2 mt-3">
          <v-chip
            v-if="filters.status"
            closable
            size="small"
            @click:close="clearStatusFilter"
            color="primary"
            variant="flat"
          >
            Status: {{ getStatusLabel(filters.status) }}
          </v-chip>
          <v-chip
            v-if="filters.type"
            closable
            size="small"
            @click:close="clearTypeFilter"
            color="primary"
            variant="flat"
          >
            Type: {{ getTypeLabel(filters.type) }}
          </v-chip>
          <v-chip
            v-if="searchQuery"
            closable
            size="small"
            @click:close="clearSearch"
            color="primary"
            variant="flat"
          >
            Search: {{ searchQuery }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Enquiries Table -->
    <v-card
      variant="outlined"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderColor: 'var(--border)',
      }"
    >
      <v-card-text class="pa-0">
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading enquiries...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <v-alert type="error" variant="tonal" class="mx-4">
            <v-alert-title>Error</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="enquiries.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-email-off</v-icon>
          <h3 class="text-h6 mb-2">No enquiries found</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ hasActiveFilters ? 'Try adjusting your filters' : 'No customer enquiries yet' }}
          </p>
          <v-btn
            v-if="hasActiveFilters"
            variant="outlined"
            @click="clearAllFilters"
          >
            Clear Filters
          </v-btn>
        </div>

        <div v-else>
          <v-data-table
            :headers="headers"
            :items="enquiries"
            :items-per-page="pagination.limit"
            :page="pagination.page"
            :server-items-length="pagination.total"
            :loading="loading"
            @update:page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
            class="enquiries-table"
            item-value="id"
            hover
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
                  <div class="text-caption text-medium-emphasis">{{ item.user.email || 'N/A' }}</div>
                  <div v-if="item.user.phone" class="text-caption text-medium-emphasis">
                    <v-icon size="12">mdi-phone</v-icon>
                    {{ item.user.phone }}
                  </div>
                </div>
              </div>
              <span v-else class="text-medium-emphasis">N/A</span>
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
              <span v-else class="text-medium-emphasis">N/A</span>
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
              <div class="d-flex gap-1">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="viewEnquiry(item.id)"
                  title="View Details"
                >
                  <v-icon size="20">mdi-eye</v-icon>
                </v-btn>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      v-bind="props"
                      title="More Actions"
                    >
                      <v-icon size="20">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="viewEnquiry(item.id)" prepend-icon="mdi-eye">
                      <v-list-item-title>View Details</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateEnquiryStatus(item)" prepend-icon="mdi-flag">
                      <v-list-item-title>Change Status</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateEnquiryType(item)" prepend-icon="mdi-tag">
                      <v-list-item-title>Change Type</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="item.vehicleId"
                      @click="viewVehicle(item.vehicleId)"
                      prepend-icon="mdi-car"
                    >
                      <v-list-item-title>View Vehicle</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>

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
import {
  getEnquiries,
  updateEnquiryStatus as updateEnquiryStatusApi,
  updateEnquiryType as updateEnquiryTypeApi,
} from '@/api/staff.api'
import type { EnquiryModel } from '@/models/enquiry.model'
import { EnquiryStatus, EnquiryType } from '@/models/enquiry.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'

const router = useRouter()

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

const headers = [
  { title: 'Subject', key: 'subject', sortable: true, width: '25%' },
  { title: 'Customer', key: 'user', sortable: false, width: '20%' },
  { title: 'Vehicle', key: 'vehicle', sortable: false, width: '18%' },
  { title: 'Type', key: 'type', sortable: true, width: '12%' },
  { title: 'Status', key: 'status', sortable: true, width: '12%' },
  { title: 'Date', key: 'createdAt', sortable: true, width: '10%' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const, width: '3%' },
]

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
    [EnquiryType.PRICE_ENQUIRY]: 'mdi-currency-usd',
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
  router.push({ name: 'staff.enquiries.detail', params: { id: enquiryId } })
}

const viewVehicle = (vehicleId: number) => {
  router.push({ name: 'staff.vehicles.detail', params: { id: vehicleId } })
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
    error.value = (err as ApiErrorModel).message || 'Failed to update status'
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
    error.value = (err as ApiErrorModel).message || 'Failed to update type'
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
    error.value = apiError?.message || 'Failed to load enquiries'
  } finally {
    loading.value = false
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
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
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

onMounted(() => {
  loadEnquiries()
})
</script>

<style scoped>
.enquiries-overview {
  padding: 0;
}

.header-section {
  padding: 0;
}

.stat-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-label {
  color: var(--muted-foreground);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  color: var(--foreground);
  line-height: 1.2;
}

.stat-icon {
  opacity: 0.8;
}

.enquiries-table {
  background-color: var(--card);
  color: var(--card-foreground);
}

.enquiries-table :deep(.v-data-table__thead) {
  background-color: var(--muted);
}

.enquiries-table :deep(.v-data-table__tr:hover) {
  background-color: var(--muted);
}

.enquiries-table :deep(.v-data-table__td) {
  padding: 12px 16px;
}

.enquiries-table :deep(.v-data-table__th) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
</style>
