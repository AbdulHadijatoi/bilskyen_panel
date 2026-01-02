<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-3">
      <div>
        <h2 class="text-h6 font-weight-bold mb-1">Manage Users</h2>
        <p class="text-caption text-medium-emphasis">
          View and manage all system users.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="showCreateDialog = true"
      >
        Create User
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
            placeholder="Search users..."
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

      <v-data-table
        v-else
        :headers="headers"
        :items="users.docs"
        :search="search"
        :items-per-page="users.limit"
        :page="users.page"
        density="compact"
        class="data-table"
        :class="$style.dataTable"
        elevation="0"
        @update:page="() => loadUsers()"
      >
        <template #item.roles="{ item }">
          <div class="d-flex gap-1 flex-wrap">
            <v-chip
              v-for="role in item.roles"
              :key="role"
              size="x-small"
              variant="flat"
              style="font-size: 0.6875rem;"
            >
              {{ role }}
            </v-chip>
          </div>
        </template>
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="x-small"
            variant="flat"
            style="font-size: 0.6875rem;"
          >
            {{ item.status || 'N/A' }}
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
                prepend-icon="mdi-eye"
                title="View"
                class="text-caption"
                @click="viewUser(item.id)"
              />
              <v-list-item
                prepend-icon="mdi-delete"
                title="Delete"
                class="text-caption text-error"
                @click="deleteUser(item.id)"
              />
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <div v-if="users.totalPages && users.totalPages > 1" class="d-flex justify-center pa-3">
        <v-pagination
          v-model="currentPage"
          :length="users.totalPages"
          density="compact"
          @update:model-value="loadUsers"
        />
      </div>
    </v-card>

    <!-- Create User Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create User</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newUser.name"
            label="Name"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newUser.email"
            label="Email"
            type="email"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newUser.password"
            label="Password"
            type="password"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newUser.phone"
            label="Phone (optional)"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createUser"
            :loading="creating"
            :disabled="!newUser.name || !newUser.email || !newUser.password"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers, createUser as createUserApi, deleteUser as deleteUserApi, type CreateUserData } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { UserModel } from '@/models/user.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const users = ref<PaginationModel<UserModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)
const showCreateDialog = ref(false)
const creating = ref(false)
const newUser = ref<CreateUserData>({
  name: '',
  email: '',
  password: '',
  phone: '',
})

const headers = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Roles', key: 'roles' },
  { title: 'Status', key: 'status', width: '100px' },
  { title: '', key: 'actions', sortable: false, width: '60px', align: 'end' as const },
]

const loadUsers = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getUsers({ page: currentPage.value, limit: 15 })
    users.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  try {
    creating.value = true
    await createUserApi(newUser.value)
    showCreateDialog.value = false
    newUser.value = { name: '', email: '', password: '', phone: '' }
    await loadUsers()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create user'
  } finally {
    creating.value = false
  }
}

const viewUser = (id: number) => {
  router.push({ name: 'admin.users.detail', params: { id } })
}

const deleteUser = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this user?')) return

  try {
    await deleteUserApi(id)
    await loadUsers()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete user'
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

onMounted(() => {
  loadUsers()
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
