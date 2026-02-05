<template>
  <div class="enquiry-detail">
    <!-- Header -->
    <div class="header-section mb-6">
      <div class="d-flex align-center gap-3 mb-2">
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          size="small"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold mb-1">Enquiry Details</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            View and manage customer enquiry information
          </p>
        </div>
        <v-btn
          v-if="enquiry"
          icon
          variant="outlined"
          size="small"
          @click="loadEnquiry"
          :loading="loading"
          title="Refresh"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !enquiry" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-2 text-medium-emphasis mt-4">Loading enquiry details...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>Error</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Enquiry Content -->
    <div v-else-if="enquiry" class="enquiry-content">
      <v-row>
        <!-- Main Content -->
        <v-col cols="12" lg="8">
          <!-- Enquiry Message Card -->
          <v-card
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <v-icon color="primary">mdi-email</v-icon>
                <span>Enquiry Message</span>
              </div>
              <v-chip
                size="small"
                variant="flat"
                :color="getStatusColor(enquiry.status)"
                class="font-weight-medium"
              >
                <v-icon start size="16">{{ getStatusIcon(enquiry.status) }}</v-icon>
                {{ enquiry.status }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Subject</div>
                <div class="text-h6 font-weight-bold">{{ enquiry.subject }}</div>
              </div>
              <v-divider class="my-4" />
              <div>
                <div class="text-caption text-medium-emphasis mb-2">Message</div>
                <div class="message-content">{{ enquiry.message }}</div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="text-subtitle-1">Quick Actions</v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-flag"
                  @click="showStatusDialog = true"
                  :loading="updating"
                >
                  Change Status
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-tag"
                  @click="showTypeDialog = true"
                  :loading="updating"
                >
                  Change Type
                </v-btn>
                <v-btn
                  v-if="enquiry.vehicleId"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-car"
                  :to="{ name: 'staff.vehicles.detail', params: { id: enquiry.vehicleId } }"
                >
                  View Vehicle
                </v-btn>
                <v-btn
                  v-if="enquiry.user?.email"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-email-outline"
                  :href="`mailto:${enquiry.user.email}?subject=Re: ${enquiry.subject}`"
                >
                  Reply via Email
                </v-btn>
                <v-btn
                  v-if="enquiry.user?.phone"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-phone"
                  :href="`tel:${enquiry.user.phone}`"
                >
                  Call Customer
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" lg="4">
          <!-- Status & Type Card -->
          <v-card
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="text-subtitle-1">Status & Type</v-card-title>
            <v-card-text>
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-2">Status</div>
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :prepend-icon="getStatusIcon(selectedStatus)"
                  @update:model-value="handleUpdateStatus"
                  :loading="updating"
                />
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-2">Type</div>
                <v-select
                  v-model="selectedType"
                  :items="typeOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :prepend-icon="getTypeIcon(selectedType)"
                  @update:model-value="handleUpdateType"
                  :loading="updating"
                />
              </div>
            </v-card-text>
          </v-card>

          <!-- Customer Information -->
          <v-card
            v-if="enquiry.user"
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="d-flex align-center gap-2">
              <v-icon>mdi-account</v-icon>
              <span>Customer</span>
            </v-card-title>
            <v-card-text>
              <div class="d-flex align-center gap-3 mb-4">
                <v-avatar size="56" color="primary">
                  <span class="text-h6">{{ getInitials(enquiry.user.name) }}</span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold">{{ enquiry.user.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ enquiry.user.email || 'N/A' }}</div>
                </div>
              </div>
              <v-divider class="my-3" />
              <div class="d-flex flex-column gap-3">
                <div v-if="enquiry.user.email" class="d-flex align-center gap-2">
                  <v-icon size="20" color="grey">mdi-email</v-icon>
                  <a :href="`mailto:${enquiry.user.email}?subject=Re: ${enquiry.subject}`" class="text-body-2 text-primary text-decoration-none">
                    {{ enquiry.user.email }}
                  </a>
                </div>
                <div v-if="enquiry.user.phone" class="d-flex align-center gap-2">
                  <v-icon size="20" color="grey">mdi-phone</v-icon>
                  <a :href="`tel:${enquiry.user.phone}`" class="text-body-2 text-primary text-decoration-none">
                    {{ enquiry.user.phone }}
                  </a>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Vehicle Information -->
          <v-card
            v-if="enquiry.vehicle"
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="d-flex align-center gap-2">
              <v-icon>mdi-car</v-icon>
              <span>Vehicle</span>
            </v-card-title>
            <v-card-text>
              <div class="mb-3">
                <div class="text-body-1 font-weight-bold mb-1">
                  {{ enquiry.vehicle.title || `Vehicle #${enquiry.vehicle.id}` }}
                </div>
                <div v-if="enquiry.vehicle.registration" class="text-caption text-medium-emphasis">
                  {{ enquiry.vehicle.registration }}
                </div>
              </div>
              <v-btn
                v-if="enquiry.vehicleId"
                color="primary"
                variant="outlined"
                block
                prepend-icon="mdi-arrow-right"
                :to="{ name: 'staff.vehicles.detail', params: { id: enquiry.vehicleId } }"
              >
                View Vehicle Details
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Enquiry Metadata -->
          <v-card
            variant="outlined"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="text-subtitle-1">Details</v-card-title>
            <v-card-text>
              <div class="d-flex flex-column gap-3">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Serial Number</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ enquiry.serialNo ? `#${enquiry.serialNo}` : 'N/A' }}
                  </div>
                </div>
                <v-divider />
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Source</div>
                  <div class="text-body-2 font-weight-medium">{{ enquiry.source || 'N/A' }}</div>
                </div>
                <v-divider />
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Submitted</div>
                  <div class="text-body-2 font-weight-medium">{{ formatDate(enquiry.createdAt) }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatTimeAgo(enquiry.createdAt) }}</div>
                </div>
                <v-divider v-if="enquiry.updatedAt" />
                <div v-if="enquiry.updatedAt">
                  <div class="text-caption text-medium-emphasis mb-1">Last Updated</div>
                  <div class="text-body-2 font-weight-medium">{{ formatDate(enquiry.updatedAt) }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Status Update Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-flag</v-icon>
          Update Status
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showStatusDialog = false" :disabled="updating">
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

    <!-- Type Update Dialog -->
    <v-dialog v-model="showTypeDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-tag</v-icon>
          Update Type
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showTypeDialog = false" :disabled="updating">
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getEnquiry, updateEnquiryStatus, updateEnquiryType } from '@/api/staff.api'
import type { EnquiryModel } from '@/models/enquiry.model'
import { EnquiryStatus, EnquiryType } from '@/models/enquiry.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref<string | null>(null)
const enquiry = ref<EnquiryModel | null>(null)
const updating = ref(false)

const selectedStatus = ref<string>('')
const selectedType = ref<string>('')
const showStatusDialog = ref(false)
const showTypeDialog = ref(false)

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

const handleUpdateStatus = async () => {
  if (!enquiry.value) return

  try {
    updating.value = true
    await updateEnquiryStatus(enquiry.value.id, { status: selectedStatus.value })
    await loadEnquiry()
    showStatusDialog.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update status'
  } finally {
    updating.value = false
  }
}

const handleUpdateType = async () => {
  if (!enquiry.value) return

  try {
    updating.value = true
    await updateEnquiryType(enquiry.value.id, { type: selectedType.value })
    await loadEnquiry()
    showTypeDialog.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update type'
  } finally {
    updating.value = false
  }
}

const loadEnquiry = async () => {
  const enquiryId = route.params.id as string
  if (!enquiryId) return

  try {
    loading.value = true
    error.value = null
    const loadedEnquiry = await getEnquiry(enquiryId)
    enquiry.value = loadedEnquiry
    selectedStatus.value = loadedEnquiry.status
    selectedType.value = loadedEnquiry.type
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load enquiry'
  } finally {
    loading.value = false
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTimeAgo = (date?: string) => {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return formatDate(date)
}

onMounted(() => {
  loadEnquiry()
})
</script>

<style scoped>
.enquiry-detail {
  padding: 0;
}

.header-section {
  padding: 0;
}

.enquiry-content {
  padding: 0;
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: var(--foreground);
  padding: 16px;
  background-color: var(--muted);
  border-radius: 8px;
  border: 1px solid var(--border);
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
</style>
