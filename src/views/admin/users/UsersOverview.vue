<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Users</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage all system users.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create User
      </v-btn>
    </div>

    <v-card variant="outlined">
      <v-card-text>
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
          :items-per-page="users.limit"
          :page="users.page"
          @update:page="loadUsers"
        >
          <template #item.roles="{ item }">
            <v-chip
              v-for="role in item.roles"
              :key="role"
              size="small"
              variant="flat"
              class="mr-1"
            >
              {{ role }}
            </v-chip>
          </template>
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              {{ item.status || 'N/A' }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="viewUser(item.id)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="deleteUser(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="users.totalPages && users.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="users.totalPages"
            @update:model-value="loadUsers"
          />
        </div>
      </v-card-text>
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
import { getUsers, createUser, deleteUser as deleteUserApi, type CreateUserData } from '@/api/admin.api'
import type { PaginationModel, UserModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
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
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Roles', key: 'roles' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
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
    await createUser(newUser.value)
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

