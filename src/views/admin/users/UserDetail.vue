<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          class="mb-2"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h5 font-weight-bold mb-1">User Details</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and edit user information.
        </p>
      </div>
      <v-btn
        v-if="user"
        color="primary"
        prepend-icon="mdi-pencil"
        @click="editMode = !editMode"
      >
        {{ editMode ? 'Cancel' : 'Edit' }}
      </v-btn>
    </div>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal">
        {{ error }}
      </v-alert>
    </div>

    <v-card v-else-if="user" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userData.name"
              label="Name"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userData.email"
              label="Email"
              type="email"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userData.phone"
              label="Phone"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis mb-1">Status</div>
              <v-chip
                :color="getStatusColor(user.status)"
                size="small"
                variant="flat"
              >
                {{ user.status || 'N/A' }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" v-if="editMode">
            <v-btn
              color="primary"
              @click="updateUser"
              :loading="updating"
            >
              Update User
            </v-btn>
            <v-btn
              color="error"
              class="ml-2"
              @click="banUser"
              :loading="banning"
              v-if="!user.banned"
            >
              Ban User
            </v-btn>
            <v-btn
              color="success"
              class="ml-2"
              @click="unbanUser"
              :loading="unbanning"
              v-else
            >
              Unban User
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser, updateUser as updateUserApi, banUser as banUserApi, unbanUser as unbanUserApi, type UpdateUserData } from '@/api/admin.api'
import type { UserModel } from '@/models/user.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const user = ref<UserModel | null>(null)
const userData = ref<UpdateUserData>({
  name: '',
  email: '',
  phone: '',
})
const editMode = ref(false)
const updating = ref(false)
const banning = ref(false)
const unbanning = ref(false)

const loadUser = async () => {
  const userId = route.params.id as string
  if (!userId) return

  try {
    loading.value = true
    error.value = null
    const loadedUser = await getUser(userId)
    user.value = loadedUser
    userData.value = {
      name: loadedUser.name,
      email: loadedUser.email,
      phone: loadedUser.phone || '',
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load user'
  } finally {
    loading.value = false
  }
}

const updateUser = async () => {
  if (!user.value) return

  try {
    updating.value = true
    const updatedUser = await updateUserApi(user.value.id, userData.value)
    user.value = updatedUser
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update user'
  } finally {
    updating.value = false
  }
}

const banUser = async () => {
  if (!user.value) return

  try {
    banning.value = true
    const bannedUser = await banUserApi(user.value.id)
    user.value = bannedUser
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to ban user'
  } finally {
    banning.value = false
  }
}

const unbanUser = async () => {
  if (!user.value) return

  try {
    unbanning.value = true
    const unbannedUser = await unbanUserApi(user.value.id)
    user.value = unbannedUser
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to unban user'
  } finally {
    unbanning.value = false
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
  loadUser()
})
</script>

