<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Staff Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage your dealer staff members and their roles.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showAddDialog = true"
      >
        Add Staff
      </v-btn>
    </div>

    <v-card
      variant="outlined"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderColor: 'var(--border)',
      }"
    >
      <v-card-text>
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
          :items-per-page="10"
        >
          <template #item.user.name="{ item }">
            {{ item.user?.name || 'N/A' }}
          </template>
          <template #item.user.email="{ item }">
            {{ item.user?.email || 'N/A' }}
          </template>
          <template #item.role.name="{ item }">
            <v-chip size="small" variant="flat">
              {{ item.role?.name || 'N/A' }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="editStaff(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="removeStaff(item.user_id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
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
  { title: 'Role', key: 'role.name' },
  { title: 'Actions', key: 'actions', sortable: false },
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

