<template>
  <div class="staff-management">
    <!-- Header -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ t('dealer.views.staff.title') }}</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage your dealer staff members
          </p>
        </div>
        <v-btn
          v-if="hasPermission('dealer.staff.manage')"
          color="primary"
          prepend-icon="mdi-plus"
          size="default"
          variant="outlined"
          @click="showAddDialog = true"
        >
          Add Staff
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
          :style="{ border: '1px solid rgba(0, 0, 0, 0.12)' }"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label text-caption text-medium-emphasis mb-1">{{ t('dealer.views.staff.totalStaff') }}</div>
                <div class="stat-value text-h4 font-weight-bold">{{ totalStaff }}</div>
              </div>
              <v-icon size="40" color="primary">mdi-account-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters Card -->
    <v-card
      variant="flat"
      class="filters-card mb-4"
      elevation="0"
      :style="{ border: '1px solid rgba(0, 0, 0, 0.12)' }"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-4 flex-wrap">
          <v-text-field
            v-model="search"
            :placeholder="t('dealer.views.staff.searchPlaceholder')"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="search-field flex-grow-1"
            style="max-width: 400px;"
            hide-details
            clearable
          />
          <v-spacer />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="loadStaff"
            :loading="loading"
            size="default"
          >
            {{ t('common.refresh') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Staff Table Card -->
    <v-card
      variant="flat"
      class="table-card"
      elevation="0"
      :style="{ border: '1px solid rgba(0, 0, 0, 0.12)' }"
    >
      <v-card-title class="card-title pa-4">
        <v-icon class="mr-2">mdi-table</v-icon>
        {{ t('dealer.views.staff.staffMembers') }}
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          {{ filteredStaff.length }} {{ filteredStaff.length === 1 ? t('dealer.views.staff.member') : t('dealer.views.staff.members') }}
        </span>
      </v-card-title>

      <v-card-text class="pa-0">
        <div v-if="loading" class="loading-container py-8">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('dealer.views.staff.loadingStaff') }}</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>{{ t('admin.views.users.error') }}</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="filteredStaff.length === 0" class="empty-container py-8 text-center">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-off</v-icon>
          <p class="text-body-1 text-medium-emphasis mb-2">{{ t('dealer.views.staff.noStaffFound') }}</p>
          <p class="text-caption text-medium-emphasis">
            {{ search ? t('dealer.views.staff.tryAdjustingSearch') : t('dealer.views.staff.addFirstStaff') }}
          </p>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="filteredStaff"
          :items-per-page="itemsPerPage"
          density="compact"
          class="staff-table"
          :class="$style.dataTable"
          elevation="0"
          hide-default-footer
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-3">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email || t('dealer.views.staff.noEmail') }}</div>
              </div>
            </div>
          </template>

          <template #item.username="{ item }">
            <div class="d-flex align-center">
              <span class="text-body-2 font-mono mr-2">{{ item.username }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyUsername(item.username)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </template>

          <template #item.phone="{ item }">
            <span class="text-body-2">{{ item.phone || '—' }}</span>
          </template>

          <template #item.created_at="{ item }">
            <span class="text-body-2 text-medium-emphasis">
              {{ formatDate(item.created_at) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  v-bind="props"
                  class="text-medium-emphasis"
                >
                  <v-icon size="20">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="pa-1">
                <v-list-item
                  v-if="hasPermission('dealer.staff.manage')"
                  prepend-icon="mdi-pencil"
                  :title="t('dealer.views.staff.edit')"
                  class="text-caption"
                  @click="editStaff(item)"
                />
                <v-list-item
                  v-if="hasPermission('dealer.staff.manage')"
                  prepend-icon="mdi-delete"
                  :title="t('dealer.views.staff.remove')"
                  class="text-caption text-error"
                  @click="confirmDelete(item)"
                />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialogs -->
    <AddStaffDialog
      v-model="showAddDialog"
      @success="handleStaffAdded"
    />

    <EditStaffDialog
      v-model="showEditDialog"
      :staff-member="selectedStaff"
      @success="handleStaffUpdated"
    />

    <DeleteStaffDialog
      v-model="showDeleteDialog"
      :staff-member="selectedStaff"
      @success="handleStaffDeleted"
    />

    <!-- Snackbar for copy notification -->
    <v-snackbar v-model="copiedSnackbar" timeout="2000" color="success">
      {{ t('dealer.views.staff.usernameCopied') }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getStaff, type StaffMember } from '@/api/dealer.api'
import { hasPermission } from '@/utils/permissions'
import AddStaffDialog from '@/components/dealer/staff/AddStaffDialog.vue'
import EditStaffDialog from '@/components/dealer/staff/EditStaffDialog.vue'
import DeleteStaffDialog from '@/components/dealer/staff/DeleteStaffDialog.vue'
import type { ApiErrorModel } from '@/models/api-error.model'

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const itemsPerPage = ref(10)
const staff = ref<StaffMember[]>([])
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedStaff = ref<StaffMember | null>(null)
const copiedSnackbar = ref(false)

// Table headers (computed so they react to locale change)
const headers = computed(() => [
  { title: t('dealer.views.staff.tableName'), key: 'name', sortable: true },
  { title: t('dealer.views.staff.tableUsername'), key: 'username', sortable: true, width: '200px' },
  { title: t('dealer.views.staff.tablePhone'), key: 'phone', sortable: false },
  { title: t('dealer.views.staff.tableJoined'), key: 'created_at', sortable: true, width: '120px' },
  { title: '', key: 'actions', sortable: false, width: '60px', align: 'end' as const },
])

// Computed stats
const totalStaff = computed(() => staff.value.length)

// Filtered staff
const filteredStaff = computed(() => {
  let filtered = staff.value

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(searchLower) ||
      (s.email && s.email.toLowerCase().includes(searchLower)) ||
      s.username.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

// Copy username to clipboard
const copyUsername = async (username: string) => {
  try {
    await navigator.clipboard.writeText(username)
    copiedSnackbar.value = true
  } catch (err) {
    console.error('Failed to copy username:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = username
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      copiedSnackbar.value = true
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
    document.body.removeChild(textArea)
  }
}

// Format date
const formatDate = (date?: string): string => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

// Load staff
const loadStaff = async () => {
  try {
    loading.value = true
    error.value = null
    const staffList = await getStaff()
    staff.value = staffList
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.staff.failedLoadStaff')
  } finally {
    loading.value = false
  }
}

// Edit staff
const editStaff = (staffMember: StaffMember) => {
  selectedStaff.value = staffMember
  showEditDialog.value = true
}

// Confirm delete
const confirmDelete = (staffMember: StaffMember) => {
  selectedStaff.value = staffMember
  showDeleteDialog.value = true
}

// Handle staff added
const handleStaffAdded = () => {
  loadStaff()
}

// Handle staff updated
const handleStaffUpdated = () => {
  loadStaff()
}

// Handle staff deleted
const handleStaffDeleted = () => {
  loadStaff()
}

onMounted(() => {
  loadStaff()
})
</script>

<style module>
.dataTable :global(.v-data-table__thead th) {
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px !important;
  background-color: transparent !important;
  color: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.dataTable :global(.v-data-table__tbody td) {
  font-size: 0.875rem !important;
  padding: 12px 16px !important;
  height: auto !important;
  background-color: transparent !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.dataTable :global(.v-data-table__tbody tr:last-child td) {
  border-bottom: none !important;
}

.dataTable :global(.v-data-table__tbody tr) {
  background-color: transparent !important;
}

.dataTable :global(.v-data-table) {
  background-color: transparent !important;
}
</style>

<style scoped>
.staff-management {
  width: 100%;
}

.header-section {
  width: 100%;
}

.stat-card {
  border-radius: 4px !important;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
}

.filters-card {
  border-radius: 4px !important;
}

.search-field :deep(.v-field) {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.table-card {
  border-radius: 4px !important;
  overflow: hidden;
}

.card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-container {
  width: 100%;
}
</style>

