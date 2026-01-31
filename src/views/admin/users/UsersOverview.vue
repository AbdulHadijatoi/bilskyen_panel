<template>
  <div class="users-overview-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">User Management</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            View and manage all system users, roles, and permissions
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="default"
          @click="showCreateDialog = true"
          elevation="2"
        >
          Create User
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Total Users</div>
                <div class="stat-value">{{ users.total || 0 }}</div>
              </div>
              <v-icon size="40" color="primary" class="stat-icon">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Active Users</div>
                <div class="stat-value text-success">{{ activeUsersCount }}</div>
              </div>
              <v-icon size="40" color="success" class="stat-icon">mdi-account-check</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Inactive Users</div>
                <div class="stat-value text-warning">{{ inactiveUsersCount }}</div>
              </div>
              <v-icon size="40" color="warning" class="stat-icon">mdi-account-off</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Suspended</div>
                <div class="stat-value text-error">{{ suspendedUsersCount }}</div>
              </div>
              <v-icon size="40" color="error" class="stat-icon">mdi-account-remove</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search Card -->
    <v-card
      variant="flat"
      class="filters-card mb-4"
      elevation="0"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-4 flex-wrap">
          <v-text-field
            v-model="search"
            placeholder="Search users by name, email..."
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="search-field flex-grow-1"
            style="max-width: 400px;"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            item-title="label"
            item-value="value"
            label="Filter by Status"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-status"
            style="max-width: 200px;"
            hide-details
            clearable
            @update:model-value="loadUsers"
          />
          <v-select
            v-model="roleFilter"
            :items="roleFilterOptions"
            item-title="label"
            item-value="value"
            label="Filter by Role"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-shield-account"
            style="max-width: 200px;"
            hide-details
            clearable
            :loading="loadingRoles"
            @update:model-value="loadUsers"
          />
          <v-spacer />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="loadUsers"
            :loading="loading"
            size="default"
          >
            Refresh
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Users Table Card -->
    <v-card
      variant="flat"
      class="table-card"
      elevation="0"
    >
      <v-card-title class="card-title">
        <v-icon class="mr-2">mdi-table</v-icon>
        Users List
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          Showing {{ users.docs.length }} of {{ users.total || 0 }} users
        </span>
      </v-card-title>

      <v-card-text class="pa-0">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading users...</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>Error</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="users.docs"
          :items-per-page="users.limit"
          :page="users.page"
          density="comfortable"
          class="users-table"
          :class="$style.dataTable"
          elevation="0"
          @update:page="handlePageChange"
        >
          <template #item.id="{ item }">
            <span class="text-medium-emphasis font-weight-medium">#{{ item.id }}</span>
          </template>

          <template #item.name="{ item }">
            <div class="d-flex align-center gap-3">
              <div class="user-avatar-small">
                <span class="avatar-text-small">{{ getUserInitials(item.name) }}</span>
              </div>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #item.roles="{ item }">
            <div class="d-flex gap-1 flex-wrap">
              <v-chip
                v-for="(role, index) in item.roles"
                :key="index"
                size="small"
                variant="flat"
                color="primary"
                class="role-chip"
              >
                <v-icon start size="14">mdi-shield-account</v-icon>
                {{ typeof role === 'string' ? role : role.name || role }}
              </v-chip>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
              prepend-icon="mdi-circle"
            >
              {{ getStatusLabel(item.statusId) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1 align-center">
              <v-tooltip text="View Details" location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    v-bind="props"
                    @click="viewUser(item.id)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete User" location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    v-bind="props"
                    @click="confirmDeleteUser(item)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-2">mdi-account-off</v-icon>
              <p class="text-body-1 text-medium-emphasis">No users found</p>
              <p class="text-caption text-medium-emphasis mt-1">
                {{ search ? 'Try adjusting your search criteria' : 'Create your first user to get started' }}
              </p>
            </div>
          </template>
        </v-data-table>

        <!-- Pagination -->
        <div v-if="users.totalPages && users.totalPages > 1" class="pagination-container pa-4">
          <v-pagination
            v-model="currentPage"
            :length="users.totalPages"
            :total-visible="7"
            density="comfortable"
            @update:model-value="handlePageChange"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Create User Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
          Create New User
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="createFormRef">
            <v-text-field
              v-model="newUser.name"
              label="Full Name"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              :rules="[v => !!v || 'Name is required']"
              class="mb-3"
            />
            <v-text-field
              v-model="newUser.email"
              label="Email Address"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              :rules="[
                v => !!v || 'Email is required',
                v => /.+@.+\..+/.test(v) || 'Email must be valid'
              ]"
              class="mb-3"
            />
            <v-text-field
              v-model="newUser.password"
              label="Password"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              :rules="[
                v => !!v || 'Password is required',
                v => (v && v.length >= 8) || 'Password must be at least 8 characters'
              ]"
              class="mb-3"
            />
            <v-text-field
              v-model="newUser.phone"
              label="Phone Number (Optional)"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-phone"
              class="mb-3"
            />
            <v-select
              v-model="newUser.status_id"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Account Status"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-status"
              :rules="[v => !!v || 'Status is required']"
              class="mb-3"
            />
            <v-select
              v-model="newUser.role_id"
              :items="roles"
              item-title="name"
              item-value="id"
              label="User Role"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-shield-account"
              :loading="loadingRoles"
              :rules="[v => !!v || 'Role is required']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelCreate">Cancel</v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="createUser"
            :loading="creating"
            :disabled="!isCreateFormValid"
          >
            Create User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Delete User
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">
            Are you sure you want to delete <strong>{{ userToDelete?.name }}</strong>?
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            This action will soft delete the user account. The user will no longer be able to access the system.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            @click="deleteUser"
            :loading="deleting"
          >
            Delete User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers, createUser as createUserApi, deleteUser as deleteUserApi, getRoles, type CreateUserData, type RoleModel } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { UserModel } from '@/models/user.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<number | null>(null)
const roleFilter = ref<string | null>(null)
const users = ref<PaginationModel<UserModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
  total: 0,
})
const currentPage = ref(1)
const showCreateDialog = ref(false)
const creating = ref(false)
const deleting = ref(false)
const loadingRoles = ref(false)
const roles = ref<RoleModel[]>([])
const showDeleteDialog = ref(false)
const userToDelete = ref<UserModel | null>(null)
const createFormRef = ref()

const newUser = ref<CreateUserData>({
  name: '',
  email: '',
  password: '',
  phone: '',
  status_id: 1, // Default to ACTIVE
  role_id: 0,
})

const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 2 },
  { label: 'Suspended', value: 3 },
]

const statusFilterOptions = [
  { label: 'All Statuses', value: null },
  ...statusOptions,
]

const roleFilterOptions = computed(() => {
  const options = [{ label: 'All Roles', value: null }]
  roles.value.forEach(role => {
    options.push({ label: role.name, value: role.name })
  })
  return options
})

const headers = [
  { title: 'ID', key: 'id', width: '100px', sortable: false },
  { title: 'User', key: 'name', sortable: false },
  { title: 'Roles', key: 'roles', sortable: false },
  { title: 'Status', key: 'status', width: '120px', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' as const },
]

const activeUsersCount = computed(() => {
  return users.value.docs.filter(u => u.statusId === 1).length
})

const inactiveUsersCount = computed(() => {
  return users.value.docs.filter(u => u.statusId === 2).length
})

const suspendedUsersCount = computed(() => {
  return users.value.docs.filter(u => u.statusId === 3).length
})

const isCreateFormValid = computed(() => {
  return !!(
    newUser.value.name &&
    newUser.value.email &&
    newUser.value.password &&
    newUser.value.password.length >= 8 &&
    newUser.value.status_id &&
    newUser.value.role_id
  )
})

const loadUsers = async () => {
  try {
    loading.value = true
    error.value = null
    const params: any = {
      page: currentPage.value,
      limit: 15,
    }
    if (statusFilter.value) {
      params.status_id = statusFilter.value
    }
    if (roleFilter.value) {
      params.role = roleFilter.value
    }
    if (search.value) {
      params.search = search.value
    }
    const response = await getUsers(params)
    users.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    loadingRoles.value = true
    const rolesData = await getRoles()
    roles.value = rolesData
  } catch (err) {
    console.error('Failed to load roles:', err)
  } finally {
    loadingRoles.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const createUser = async () => {
  if (!isCreateFormValid.value) return

  try {
    creating.value = true
    error.value = null
    await createUserApi(newUser.value)
    showCreateDialog.value = false
    cancelCreate()
    await loadUsers()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create user'
  } finally {
    creating.value = false
  }
}

const cancelCreate = () => {
  newUser.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    status_id: 1,
    role_id: 0,
  }
  if (createFormRef.value) {
    createFormRef.value.resetValidation()
  }
}

const viewUser = (id: number) => {
  router.push({ name: 'admin.users.detail', params: { id } })
}

const confirmDeleteUser = (user: UserModel) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    deleting.value = true
    error.value = null
    await deleteUserApi(userToDelete.value.id)
    showDeleteDialog.value = false
    userToDelete.value = null
    await loadUsers()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete user'
  } finally {
    deleting.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    suspended: 'error',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
}

const getStatusLabel = (statusId?: number) => {
  const status = statusOptions.find(s => s.value === statusId)
  return status?.label || 'Unknown'
}

const getUserInitials = (name: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<style module>
.dataTable :global(.v-data-table__thead th) {
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px !important;
  background-color: rgba(0, 0, 0, 0.02) !important;
  color: rgba(0, 0, 0, 0.87) !important;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08) !important;
}

.dataTable :global(.v-data-table__tbody td) {
  font-size: 0.875rem !important;
  padding: 16px !important;
  height: auto !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.dataTable :global(.v-data-table__tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.dataTable :global(.v-data-table) {
  background-color: transparent !important;
}
</style>

<style scoped>
.users-overview-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 24px;
}

.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
}

.stat-icon {
  opacity: 0.8;
}

.filters-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

.table-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.error-container {
  min-height: 200px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 1) 0%, rgba(var(--v-theme-primary), 0.7) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text-small {
  font-size: 14px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.role-chip {
  font-size: 0.75rem;
}

.action-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.pagination-container {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 0, 0, 0.01);
}

.gap-1 {
  gap: 4px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.users-table {
  background-color: transparent;
}

@media (max-width: 960px) {
  .users-overview-container {
    padding: 16px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 32px !important;
  }
}
</style>
