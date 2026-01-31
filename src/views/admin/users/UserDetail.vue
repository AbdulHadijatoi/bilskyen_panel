<template>
  <div class="user-detail-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex align-center gap-4 mb-4">
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          size="large"
          class="back-button"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold mb-1">User Details</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage user account information and settings
          </p>
        </div>
        <v-btn
          v-if="user && !editMode"
          color="primary"
          prepend-icon="mdi-pencil"
          @click="editMode = true"
          size="default"
        >
          Edit User
        </v-btn>
        <div v-else-if="user && editMode" class="d-flex gap-2">
          <v-btn
            variant="outlined"
            @click="cancelEdit"
            size="default"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="updateUser"
            :loading="updating"
            size="default"
          >
            Save Changes
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">Loading user information...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-6"
    >
      <v-alert-title>Error</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- User Content -->
    <div v-else-if="user" class="user-content">
      <!-- User Profile Header Card -->
      <v-card
        variant="flat"
        class="profile-header-card mb-6"
        elevation="0"
      >
        <v-card-text class="pa-6">
          <div class="d-flex align-center gap-6">
            <!-- Avatar -->
            <div class="user-avatar">
              <div class="avatar-circle">
                <span class="avatar-text">{{ getUserInitials(user.name) }}</span>
              </div>
            </div>
            
            <!-- User Info -->
            <div class="flex-grow-1">
              <h2 class="text-h5 font-weight-bold mb-2">{{ user.name }}</h2>
              <div class="d-flex align-center gap-4 flex-wrap">
                <div class="d-flex align-center gap-2">
                  <v-icon size="18" color="medium-emphasis">mdi-email</v-icon>
                  <span class="text-body-2">{{ user.email }}</span>
                </div>
                <div v-if="user.phone" class="d-flex align-center gap-2">
                  <v-icon size="18" color="medium-emphasis">mdi-phone</v-icon>
                  <span class="text-body-2">{{ user.phone }}</span>
                </div>
                <div class="d-flex align-center gap-2">
                  <v-chip
                    :color="getStatusColor(user.status)"
                    size="small"
                    variant="flat"
                    prepend-icon="mdi-circle"
                  >
                    {{ getStatusLabel(user.statusId) }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Quick Actions (Read-only mode) -->
            <div v-if="!editMode" class="quick-actions">
              <v-btn
                v-if="user.statusId !== 3"
                color="error"
                variant="outlined"
                prepend-icon="mdi-account-off"
                @click="confirmBanUser"
                :loading="banning"
                size="small"
              >
                Ban User
              </v-btn>
              <v-btn
                v-else
                color="success"
                variant="outlined"
                prepend-icon="mdi-account-check"
                @click="confirmUnbanUser"
                :loading="unbanning"
                size="small"
              >
                Unban User
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Content Grid -->
      <v-row>
        <!-- Left Column - Personal Information -->
        <v-col cols="12" lg="8">
          <v-card
            variant="flat"
            class="info-card mb-4"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon class="mr-2">mdi-account</v-icon>
              Personal Information
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="6">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Full Name</div>
                    <div class="field-value">{{ user.name }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="userData.name"
                    label="Full Name"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Email Address</div>
                    <div class="field-value">{{ user.email }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="userData.email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-email"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Phone Number</div>
                    <div class="field-value">{{ user.phone || 'Not provided' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="userData.phone"
                    label="Phone Number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-phone"
                    placeholder="Optional"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">User ID</div>
                    <div class="field-value text-medium-emphasis">#{{ user.id }}</div>
                  </div>
                  <v-text-field
                    v-else
                    :model-value="user.id"
                    label="User ID"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-identifier"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Account Settings Card -->
          <v-card
            variant="flat"
            class="info-card"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon class="mr-2">mdi-cog</v-icon>
              Account Settings
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="6">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Account Status</div>
                    <v-chip
                      :color="getStatusColor(user.status)"
                      size="default"
                      variant="flat"
                      class="mt-2"
                    >
                      <v-icon start size="16">mdi-circle</v-icon>
                      {{ getStatusLabel(user.statusId) }}
                    </v-chip>
                  </div>
                  <v-select
                    v-else
                    v-model="userData.status_id"
                    :items="statusOptions"
                    item-title="label"
                    item-value="value"
                    label="Account Status"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-status"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">User Role</div>
                    <div class="d-flex gap-2 flex-wrap mt-2">
                      <v-chip
                        v-for="role in user.roles"
                        :key="role"
                        color="primary"
                        size="default"
                        variant="flat"
                        prepend-icon="mdi-shield-account"
                      >
                        {{ role }}
                      </v-chip>
                    </div>
                  </div>
                  <v-select
                    v-else
                    v-model="userData.role_id"
                    :items="roles"
                    item-title="name"
                    item-value="id"
                    label="User Role"
                    variant="outlined"
                    density="comfortable"
                    :loading="loadingRoles"
                    prepend-inner-icon="mdi-shield-account"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Password Management Card -->
          <v-card
            variant="flat"
            class="info-card mt-4"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon class="mr-2">mdi-lock</v-icon>
              Password Management
            </v-card-title>
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="field-label mb-1">Password</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Last changed: {{ formatDate(user.updatedAt) }}
                  </div>
                </div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-key"
                  @click="showPasswordDialog = true"
                  size="small"
                >
                  Change Password
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Account Information -->
        <v-col cols="12" lg="4">
          <v-card
            variant="flat"
            class="info-card"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon class="mr-2">mdi-information</v-icon>
              Account Information
            </v-card-title>
            <v-card-text class="pa-6">
              <div class="info-list">
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="18" class="mr-2">mdi-calendar-plus</v-icon>
                    Created
                  </div>
                  <div class="info-item-value">
                    {{ formatDate(user.createdAt) }}
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="18" class="mr-2">mdi-calendar-edit</v-icon>
                    Last Updated
                  </div>
                  <div class="info-item-value">
                    {{ formatDate(user.updatedAt) }}
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="18" class="mr-2">mdi-email-check</v-icon>
                    Email Verified
                  </div>
                  <div class="info-item-value">
                    <v-chip
                      :color="user.emailVerified ? 'success' : 'warning'"
                      size="small"
                      variant="flat"
                    >
                      {{ user.emailVerified ? 'Verified' : 'Not Verified' }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Change Password Dialog -->
    <v-dialog v-model="showPasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-key</v-icon>
          Change Password
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Enter a new password for <strong>{{ user?.name }}</strong>. The password must be at least 8 characters long.
          </p>
          <v-text-field
            v-model="newPassword"
            label="New Password"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock"
            :rules="passwordRules"
            :error-messages="passwordError"
            class="mb-2"
          />
          <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-check"
            :rules="confirmPasswordRules"
            class="mb-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelPasswordChange">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="changePassword"
            :loading="changingPassword"
            :disabled="!newPassword || !confirmPassword || newPassword !== confirmPassword"
          >
            Change Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ban/Unban Confirmation Dialog -->
    <v-dialog v-model="showBanDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon :color="user?.statusId === 3 ? 'success' : 'error'" class="mr-2">
            {{ user?.statusId === 3 ? 'mdi-account-check' : 'mdi-account-off' }}
          </v-icon>
          {{ user?.statusId === 3 ? 'Unban User' : 'Ban User' }}
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">
            Are you sure you want to {{ user?.statusId === 3 ? 'unban' : 'ban' }} 
            <strong>{{ user?.name }}</strong>?
          </p>
          <p v-if="user?.statusId !== 3" class="text-body-2 text-medium-emphasis mt-2">
            This will suspend the user's account and prevent them from accessing the system.
          </p>
          <p v-else class="text-body-2 text-medium-emphasis mt-2">
            This will restore the user's account access.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showBanDialog = false">Cancel</v-btn>
          <v-btn
            :color="user?.statusId === 3 ? 'success' : 'error'"
            @click="user?.statusId === 3 ? unbanUser() : banUser()"
            :loading="banning || unbanning"
          >
            {{ user?.statusId === 3 ? 'Unban' : 'Ban' }} User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser, updateUser as updateUserApi, banUser as banUserApi, unbanUser as unbanUserApi, changeUserPassword, getRoles, type UpdateUserData, type RoleModel } from '@/api/admin.api'
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
  status_id: undefined,
  role_id: undefined,
})
const editMode = ref(false)
const updating = ref(false)
const banning = ref(false)
const unbanning = ref(false)
const loadingRoles = ref(false)
const roles = ref<RoleModel[]>([])
const showBanDialog = ref(false)
const showPasswordDialog = ref(false)
const changingPassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 2 },
  { label: 'Suspended', value: 3 },
]

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
      status_id: loadedUser.statusId,
      role_id: undefined,
    }
    // Set role_id from first role if available
    if (loadedUser.roles && loadedUser.roles.length > 0 && roles.value.length > 0) {
      const firstRole = loadedUser.roles[0]
      // Roles are normalized to strings in mapUserFromApi, but handle both cases for safety
      const roleName = typeof firstRole === 'string' ? firstRole : (firstRole && typeof firstRole === 'object' && 'name' in firstRole ? String((firstRole as any).name) : String(firstRole))
      const role = roles.value.find(r => r.name === roleName)
      if (role) {
        userData.value.role_id = role.id
      }
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load user'
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  if (!user.value) return
  editMode.value = false
  // Reset form data
  userData.value = {
    name: user.value.name,
    email: user.value.email,
    phone: user.value.phone || '',
    status_id: user.value.statusId,
    role_id: undefined,
  }
  // Reset role_id
  if (user.value.roles && user.value.roles.length > 0 && roles.value.length > 0) {
    const firstRole = user.value.roles[0]
    // Roles are normalized to strings in mapUserFromApi, but handle both cases for safety
    const roleName = typeof firstRole === 'string' ? firstRole : (firstRole && typeof firstRole === 'object' && 'name' in firstRole ? String((firstRole as any).name) : String(firstRole))
    const role = roles.value.find(r => r.name === roleName)
    if (role) {
      userData.value.role_id = role.id
    }
  }
}

const updateUser = async () => {
  if (!user.value) return

  try {
    updating.value = true
    error.value = null
    const updatedUser = await updateUserApi(user.value.id, userData.value)
    user.value = updatedUser
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update user'
  } finally {
    updating.value = false
  }
}

const confirmBanUser = () => {
  showBanDialog.value = true
}

const confirmUnbanUser = () => {
  showBanDialog.value = true
}

const banUser = async () => {
  if (!user.value) return

  try {
    banning.value = true
    error.value = null
    const bannedUser = await banUserApi(user.value.id)
    user.value = bannedUser
    showBanDialog.value = false
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
    error.value = null
    const unbannedUser = await unbanUserApi(user.value.id)
    user.value = unbannedUser
    showBanDialog.value = false
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

const getStatusLabel = (statusId?: number) => {
  const status = statusOptions.find(s => s.value === statusId)
  return status?.label || 'Unknown'
}

const getUserInitials = (name: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(' ').filter(p => p.length > 0)
  if (parts.length >= 2) {
    const first = parts[0]
    const last = parts[parts.length - 1]
    if (first && last && first[0] && last[0]) {
      return (first[0] + last[0]).toUpperCase()
    }
  }
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (date?: string): string => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date
  }
}

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => (v && v.length >= 8) || 'Password must be at least 8 characters',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm password',
  (v: string) => v === newPassword.value || 'Passwords do not match',
]

const cancelPasswordChange = () => {
  showPasswordDialog.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
}

const changePassword = async () => {
  if (!user.value) return
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }

  try {
    changingPassword.value = true
    error.value = null
    passwordError.value = ''
    await changeUserPassword(user.value.id, { password: newPassword.value })
    showPasswordDialog.value = false
    newPassword.value = ''
    confirmPassword.value = ''
    // Reload user to update updatedAt timestamp
    await loadUser()
  } catch (err) {
    passwordError.value = (err as ApiErrorModel).message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

const setRoleIdFromUser = () => {
  if (!user.value || roles.value.length === 0) return
  
  if (user.value.roles && user.value.roles.length > 0) {
    const firstRole = user.value.roles[0]
    // Roles are normalized to strings in mapUserFromApi, but handle both cases for safety
    const roleName = typeof firstRole === 'string' ? firstRole : (firstRole && typeof firstRole === 'object' && 'name' in firstRole ? String((firstRole as any).name) : String(firstRole))
    const role = roles.value.find(r => r.name === roleName)
    if (role && !userData.value.role_id) {
      userData.value.role_id = role.id
    }
  }
}

onMounted(async () => {
  await loadRoles()
  await loadUser()
  setRoleIdFromUser()
})
</script>

<style scoped>
.user-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 24px;
}

.back-button {
  min-width: 48px;
  height: 48px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.profile-header-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 1) 0%, rgba(var(--v-theme-primary), 0.7) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-text {
  font-size: 28px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.info-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 20px 24px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.info-field {
  margin-bottom: 24px;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.field-value {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  word-break: break-word;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
}

.info-item-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-top: 4px;
}

.quick-actions {
  flex-shrink: 0;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.gap-6 {
  gap: 24px;
}

@media (max-width: 960px) {
  .user-detail-container {
    padding: 16px;
  }

  .profile-header-card :deep(.v-card-text) {
    padding: 24px !important;
  }

  .avatar-circle {
    width: 64px;
    height: 64px;
  }

  .avatar-text {
    font-size: 24px;
  }
}
</style>
