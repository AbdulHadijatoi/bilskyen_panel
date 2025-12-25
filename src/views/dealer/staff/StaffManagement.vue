<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-3">
      <div>
        <h2 class="text-h6 font-weight-bold mb-1">Staff Management</h2>
        <p class="text-caption text-medium-emphasis">
          Manage your dealer staff members and their roles.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="showAddDialog = true"
      >
        Add Staff
      </v-btn>
    </div>

    <!-- Filters Card -->
    <v-card
      variant="flat"
      class="filters-card mb-3"
      elevation="0"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
      }"
    >
      <v-card-text class="pa-3">
        <div class="d-flex justify-space-between align-center">
          <v-text-field
            v-model="search"
            placeholder="Search staff..."
            density="compact"
            variant="plain"
            prepend-inner-icon="mdi-magnify"
            class="search-field"
            hide-details
            style="max-width: 300px;"
          />
          <div class="d-flex gap-2">
            <v-btn 
              variant="outlined" 
              density="compact" 
              size="small"
              prepend-icon="mdi-filter-variant"
              class="action-btn"
            >
              Filter
            </v-btn>
            <v-btn 
              variant="outlined" 
              density="compact" 
              size="small"
              prepend-icon="mdi-sort"
              class="action-btn"
            >
              Sort
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Table Card -->
    <v-card
      variant="flat"
      class="table-card"
      elevation="0"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
      }"
    >
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else-if="error" class="text-center py-8">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <div v-else-if="staff.length === 0" class="text-center py-8">
        <p class="text-medium-emphasis">No staff members yet</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="staff"
        :search="search"
        :items-per-page="10"
        density="compact"
        class="data-table"
        :class="$style.dataTable"
        elevation="0"
      >
        <template #item.user.name="{ item }">
          <span style="font-size: 0.75rem;">{{ item.user?.name || 'N/A' }}</span>
        </template>
        <template #item.user.email="{ item }">
          <span style="font-size: 0.75rem;">{{ item.user?.email || 'N/A' }}</span>
        </template>
        <template #item.role.name="{ item }">
          <v-chip
            size="x-small"
            variant="flat"
            style="font-size: 0.6875rem;"
          >
            {{ item.role?.name || 'N/A' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn 
                icon 
                variant="text" 
                size="x-small"
                v-bind="props"
                class="text-medium-emphasis"
              >
                <v-icon size="16">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" class="pa-1">
              <v-list-item
                prepend-icon="mdi-pencil"
                title="Edit"
                class="text-caption"
                @click="editStaff(item)"
              />
              <v-list-item
                prepend-icon="mdi-delete"
                title="Delete"
                class="text-caption text-error"
                @click="removeStaff(item.user_id)"
              />
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add Staff Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>Add Staff Member</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newStaffUserId"
            label="User ID"
            type="number"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newStaffRoleId"
            label="Role ID (optional)"
            type="number"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="addStaff"
            :loading="adding"
            :disabled="!newStaffUserId"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Staff Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Staff Member</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editStaffRoleId"
            label="Role ID"
            type="number"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="updateStaff"
            :loading="updating"
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
import { getStaff, addStaff as addStaffApi, updateStaff as updateStaffApi, removeStaff as removeStaffApi, type AddStaffData, type UpdateStaffData } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const staff = ref<any[]>([])
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const newStaffUserId = ref<number | null>(null)
const newStaffRoleId = ref<number | null>(null)
const editStaffUserId = ref<number | null>(null)
const editStaffRoleId = ref<number | null>(null)
const adding = ref(false)
const updating = ref(false)

const headers = [
  { title: 'Name', key: 'user.name' },
  { title: 'Email', key: 'user.email' },
  { title: 'Role', key: 'role.name', width: '120px' },
  { title: '', key: 'actions', sortable: false, width: '60px', align: 'end' },
]

const loadStaff = async () => {
  try {
    loading.value = true
    error.value = null
    const staffList = await getStaff()
    staff.value = staffList
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load staff'
  } finally {
    loading.value = false
  }
}

const addStaff = async () => {
  if (!newStaffUserId.value) return

  try {
    adding.value = true
    const data: AddStaffData = {
      user_id: newStaffUserId.value,
    }
    if (newStaffRoleId.value) {
      data.role_id = newStaffRoleId.value
    }
    await addStaffApi(data)
    showAddDialog.value = false
    newStaffUserId.value = null
    newStaffRoleId.value = null
    await loadStaff()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to add staff'
  } finally {
    adding.value = false
  }
}

const editStaff = (staffMember: any) => {
  editStaffUserId.value = staffMember.user_id
  editStaffRoleId.value = staffMember.role_id || null
  showEditDialog.value = true
}

const updateStaff = async () => {
  if (!editStaffUserId.value) return

  try {
    updating.value = true
    const data: UpdateStaffData = {}
    if (editStaffRoleId.value) {
      data.role_id = editStaffRoleId.value
    }
    await updateStaffApi(editStaffUserId.value, data)
    showEditDialog.value = false
    editStaffUserId.value = null
    editStaffRoleId.value = null
    await loadStaff()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update staff'
  } finally {
    updating.value = false
  }
}

const removeStaff = async (userId: number | string) => {
  if (!confirm('Are you sure you want to remove this staff member?')) return

  try {
    await removeStaffApi(userId)
    await loadStaff()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to remove staff'
  }
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
  color: var(--muted-foreground);
}

.dataTable :global(.v-data-table__tbody td) {
  font-size: 0.75rem !important;
  padding: 12px 16px !important;
  height: auto !important;
  background-color: transparent !important;
}

.dataTable :global(.v-data-table__tbody tr) {
  border-bottom: none;
  background-color: transparent !important;
}

.dataTable :global(.v-data-table__tbody tr:hover) {
  background-color: transparent !important;
}

.dataTable :global(.v-data-table) {
  background-color: transparent !important;
}
</style>

<style scoped>
.filters-card {
  box-shadow: none !important;
}

.table-card {
  box-shadow: none !important;
  overflow: hidden;
}

.search-field :deep(.v-field) {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent !important;
}

.search-field :deep(.v-field__input) {
  font-size: 0.75rem;
  padding: 4px 8px;
}

.search-field :deep(.v-field__prepend-inner) {
  padding: 0 8px;
}

.action-btn {
  border-color: rgba(0, 0, 0, 0.12) !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  text-transform: none !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
  height: 32px !important;
  min-width: unset !important;
}

.action-btn :deep(.v-btn__prepend) {
  margin-inline-end: 6px !important;
}

.action-btn :deep(.v-icon) {
  font-size: 16px !important;
}

.action-btn:hover {
  background-color: var(--muted) !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
}

.data-table :deep(.v-data-table) {
  box-shadow: none !important;
  border: none !important;
}

.data-table :deep(.v-data-table-footer) {
  font-size: 0.6875rem;
  padding: 12px 16px;
  border-top: none !important;
  background-color: transparent !important;
}

.data-table :deep(.v-data-table-footer__items-per-page) {
  font-size: 0.6875rem;
}

.data-table :deep(.v-data-table-footer__pagination) {
  font-size: 0.6875rem;
}

.data-table :deep(.v-data-table__thead) {
  border-bottom: none !important;
}
</style>

