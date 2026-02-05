<template>
  <div class="permissions-management">
    <!-- Header -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Permissions Management</h1>
          <p class="text-body-2 text-medium-emphasis">
            Manage permissions for users and roles. Assign or revoke permissions to control access.
          </p>
        </div>
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-cached"
          size="default"
          :loading="clearingCache"
          @click="handleClearCache"
          :style="{ border: '1px solid #f5f5f5' }"
        >
          Clear Cache
        </v-btn>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="permissions-layout">
      <!-- Left Sidebar: Roles List -->
      <div class="roles-sidebar">
        <v-card variant="flat" :style="{ border: '1px solid #f5f5f5' }">
          <v-card-text class="pa-3">
            <!-- Role Search (Hidden for now - can be enabled later if needed) -->
            <v-autocomplete
              v-if="false"
              v-model="selectedModel"
              :items="modelOptions"
              :loading="searchingModels"
              :search="modelSearchQuery"
              @update:search="handleModelSearchInput"
              @keydown.enter.prevent="handleModelSearch"
              item-title="name"
              item-value="id"
              label="Search roles"
              placeholder="Type to search..."
              clearable
              return-object
              :no-filter="true"
              @update:model-value="handleModelSelect"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-4"
              :style="{ border: '1px solid #f5f5f5' }"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" density="compact">
                  <template v-slot:prepend>
                    <v-icon size="20" color="primary">mdi-shield-account</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ formatRoleName(item.raw.name) }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.raw.email" class="text-caption">{{ item.raw.email }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>

            <!-- Roles List -->
            <div v-if="rolesList.length > 0" class="roles-list">
              <div class="text-caption text-medium-emphasis mb-2 px-2">Roles</div>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="role in rolesList"
                  :key="role.id"
                  :class="{ 'role-active': selectedModel?.id === role.id }"
                  @click="handleRoleSelect(role)"
                  class="role-item"
                >
                  <template v-slot:prepend>
                    <v-icon size="18" :color="selectedModel?.id === role.id ? 'primary' : 'grey-lighten-1'">
                      mdi-shield-account
                    </v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ formatRoleName(role.name) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Right Column: Permissions -->
      <div class="permissions-column">
        <!-- Filter Tabs -->
        <v-card
          v-if="isFilterApplied"
          variant="flat"
          class="mb-4"
          :style="{ border: '1px solid #f5f5f5' }"
        >
          <v-card-text class="pa-3">
            <div class="d-flex justify-space-between align-center">
              <div v-if="selectedModel" class="d-flex align-center gap-2">
                <v-icon size="20" color="primary">mdi-shield-account</v-icon>
                <span class="text-body-2 font-weight-medium">
                  {{ formatRoleName(selectedModel.name) }}
                </span>
              </div>
              <v-btn-toggle
                v-model="filterType"
                mandatory
                divided
                variant="outlined"
                density="compact"
                :style="{ border: '1px solid #f5f5f5' }"
              >
                <v-btn value="all" size="small">All</v-btn>
                <v-btn value="assigned" size="small">Assigned</v-btn>
                <v-btn value="unassigned" size="small">Unassigned</v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>

        <!-- Permissions List -->
        <v-card
          v-if="isFilterApplied"
          variant="flat"
          :style="{ border: '1px solid #f5f5f5' }"
        >
          <v-card-text class="pa-4">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div v-else-if="filteredItems.length === 0" class="text-center py-12">
              <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-shield-lock-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis mb-1">No permissions found</p>
              <p class="text-caption text-medium-emphasis">
                {{ filterType === 'assigned' ? 'No assigned permissions' : filterType === 'unassigned' ? 'All permissions are assigned' : 'No permissions available' }}
              </p>
            </div>

            <div v-else class="permissions-list">
              <div
                v-for="(item, index) in filteredItems"
                :key="index"
                class="permission-group"
                :style="{ border: '1px solid #f5f5f5', borderBottom: 'none' }"
              >
                <div class="permission-group-header">
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-caption font-weight-medium text-capitalize">{{ formatEntityName(item.name) }}</span>
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getAssignedCount(item) > 0 ? 'primary' : 'grey-lighten-3'"
                      :style="{ backgroundColor: getAssignedCount(item) > 0 ? undefined : '#f5f5f5', height: '18px' }"
                    >
                      {{ getAssignedCount(item) }}/{{ item.actions.length }}
                    </v-chip>
                  </div>
                </div>
                <div class="permission-group-content">
                  <div class="permissions-horizontal">
                    <div
                      v-for="action in item.actions"
                      :key="action.id"
                      class="permission-item"
                    >
                      <v-checkbox
                        :model-value="isPermissionAssigned(action.id)"
                        :disabled="processingItems.includes(action.id)"
                        :loading="processingItems.includes(action.id)"
                        @update:model-value="togglePermission(action)"
                        color="primary"
                        hide-details
                        density="compact"
                        class="permission-checkbox"
                      />
                      <div class="permission-label">
                        <v-icon size="14" :color="isPermissionAssigned(action.id) ? 'primary' : 'grey-lighten-1'">
                          {{ getActionIcon(action.action) }}
                        </v-icon>
                        <span class="text-caption text-capitalize">{{ action.action }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Empty State -->
        <v-card
          v-else
          variant="flat"
          :style="{ border: '1px solid #f5f5f5' }"
        >
          <v-card-text class="pa-8">
            <div class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-shield-lock-outline</v-icon>
              <p class="text-h6 mb-2">Select a Role</p>
              <p class="text-body-2 text-medium-emphasis">
                Choose a role from the left sidebar to view and manage their permissions.
              </p>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" size="small" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '@/utils/axios'

interface PermissionAction {
  id: number
  action: string
  status: number
}

interface PermissionItem {
  name: string
  actions: PermissionAction[]
}

interface ModelOption {
  id: number
  name: string
  email?: string
  type: string
}

// State
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})
const loading = ref(false)
const searchingModels = ref(false)
const clearingCache = ref(false)
const modelType = ref<'user' | 'role'>('role')
const selectedModel = ref<ModelOption | null>(null)
const modelSearchQuery = ref('')
const modelOptions = ref<ModelOption[]>([])
const allItems = ref<PermissionItem[]>([])
const assignedPermissionIds = ref<number[]>([])
const filterType = ref<'all' | 'assigned' | 'unassigned'>('all')
const processingItems = ref<number[]>([])
const expandedPanels = ref<number[]>([])
const rolesList = ref<ModelOption[]>([])

// Computed
const isFilterApplied = computed(() => selectedModel.value !== null)

const filteredItems = computed(() => {
  if (!isFilterApplied.value) return []

  let items = allItems.value

  if (filterType.value === 'assigned') {
    items = items.map(item => ({
      ...item,
      actions: item.actions.filter(action => isPermissionAssigned(action.id))
    })).filter(item => item.actions.length > 0)
  } else if (filterType.value === 'unassigned') {
    items = items.map(item => ({
      ...item,
      actions: item.actions.filter(action => !isPermissionAssigned(action.id))
    })).filter(item => item.actions.length > 0)
  }

  return items
})

// Methods
const getAllItems = async () => {
  try {
    loading.value = true
    const response = await apiClient.post('/admin/permissions/get-all-items')
    allItems.value = response.data.items
  } catch (error: any) {
    console.error('Failed to load permissions:', error)
    showSnackbar('Failed to load permissions', 'error')
  } finally {
    loading.value = false
  }
}

const handleModelSearchInput = (query: string) => {
  modelSearchQuery.value = query
  
  if (!query || query.length < 2) {
    modelOptions.value = []
  }
}

const handleModelSearch = async () => {
  const query = modelSearchQuery.value
  
  if (!query || query.length < 2) {
    modelOptions.value = []
    return
  }

  try {
    searchingModels.value = true
    const response = await apiClient.post('/admin/permissions/get-models', {
      type: modelType.value,
      query: query,
      limit: 10
    })
    modelOptions.value = response.data.models
  } catch (error: any) {
    console.error('Failed to search models:', error)
    showSnackbar('Failed to search users/roles', 'error')
  } finally {
    searchingModels.value = false
  }
}

const handleModelSelect = async (model: ModelOption | null) => {
  if (!model) {
    selectedModel.value = null
    assignedPermissionIds.value = []
    return
  }

  selectedModel.value = model
  await getModelItems()
}

const handleRoleSelect = async (role: ModelOption) => {
  selectedModel.value = role
  await getModelItems()
}

const getModelItems = async () => {
  if (!selectedModel.value) return

  try {
    loading.value = true
    const response = await apiClient.post('/admin/permissions/model-items', {
      model_type: modelType.value,
      model_id: selectedModel.value.id
    })
    assignedPermissionIds.value = response.data.permission_ids
  } catch (error: any) {
    console.error('Failed to load model items:', error)
    showSnackbar('Failed to load assigned permissions', 'error')
  } finally {
    loading.value = false
  }
}

const isPermissionAssigned = (permissionId: number): boolean => {
  return assignedPermissionIds.value.includes(permissionId)
}

const togglePermission = async (action: PermissionAction) => {
  if (!selectedModel.value) return

  const isAssigned = isPermissionAssigned(action.id)

  if (isAssigned) {
    await revokePermission(action)
  } else {
    await assignPermission(action)
  }
}

const assignPermission = async (action: PermissionAction) => {
  if (!selectedModel.value) return

  processingItems.value.push(action.id)

  try {
    await apiClient.post('/admin/permissions/assign', {
      model_type: modelType.value,
      model_id: selectedModel.value.id,
      permission_id: action.id
    })

    assignedPermissionIds.value.push(action.id)
    showSnackbar('Permission assigned successfully', 'success')
  } catch (error: any) {
    console.error('Failed to assign permission:', error)
    const message = error.response?.data?.message || 'Failed to assign permission'
    showSnackbar(message, 'error')
  } finally {
    processingItems.value = processingItems.value.filter(id => id !== action.id)
  }
}

const revokePermission = async (action: PermissionAction) => {
  if (!selectedModel.value) return

  processingItems.value.push(action.id)

  try {
    await apiClient.post('/admin/permissions/revoke', {
      model_type: modelType.value,
      model_id: selectedModel.value.id,
      permission_id: action.id
    })

    assignedPermissionIds.value = assignedPermissionIds.value.filter(id => id !== action.id)
    showSnackbar('Permission revoked successfully', 'success')
  } catch (error: any) {
    console.error('Failed to revoke permission:', error)
    const message = error.response?.data?.message || 'Failed to revoke permission'
    showSnackbar(message, 'error')
  } finally {
    processingItems.value = processingItems.value.filter(id => id !== action.id)
  }
}

const getAssignedCount = (item: PermissionItem): number => {
  return item.actions.filter(action => isPermissionAssigned(action.id)).length
}

const formatEntityName = (name: string): string => {
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatRoleName = (name: string): string => {
  // Convert snake_case or kebab-case to Title Case
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getActionIcon = (action: string): string => {
  const icons: Record<string, string> = {
    'list': 'mdi-format-list-bulleted',
    'view': 'mdi-eye',
    'create': 'mdi-plus',
    'update': 'mdi-pencil',
    'edit': 'mdi-pencil',
    'delete': 'mdi-delete',
    'upload': 'mdi-upload',
    'assign': 'mdi-link',
    'manage': 'mdi-cog',
    'status': 'mdi-toggle-switch',
    'media': 'mdi-image',
    'messages': 'mdi-message',
  }
  return icons[action] || 'mdi-check-circle'
}

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

const handleClearCache = async () => {
  try {
    clearingCache.value = true
    await apiClient.post('/admin/permissions/clear-cache')
    showSnackbar('Cache cleared successfully', 'success')
    // Reload permissions after cache clear
    await getAllItems()
    // Reload model items if a model is selected
    if (selectedModel.value) {
      await getModelItems()
    }
  } catch (error: any) {
    console.error('Failed to clear cache:', error)
    const message = error.response?.data?.message || 'Failed to clear cache'
    showSnackbar(message, 'error')
  } finally {
    clearingCache.value = false
  }
}

const loadRolesList = async () => {
  try {
    const response = await apiClient.post('/admin/permissions/get-models', {
      type: 'role',
      query: '',
      limit: 100
    })
    rolesList.value = response.data.models
    
    // Auto-select the first role if available and no role is currently selected
    if (rolesList.value.length > 0 && !selectedModel.value && rolesList.value[0]) {
      await handleRoleSelect(rolesList.value[0])
    }
  } catch (error: any) {
    console.error('Failed to load roles list:', error)
  }
}

// Watchers
watch(modelType, () => {
  selectedModel.value = null
  assignedPermissionIds.value = []
  modelOptions.value = []
  modelSearchQuery.value = ''
  if (modelType.value === 'role') {
    loadRolesList()
  } else {
    rolesList.value = []
  }
})

// Lifecycle
onMounted(async () => {
  // Load permissions first
  await getAllItems()
  // Then load roles and auto-select the first one
  if (modelType.value === 'role') {
    await loadRolesList()
  }
})
</script>

<style scoped>
.permissions-management {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  padding: 0;
}

.permissions-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

.roles-sidebar {
  position: sticky;
  top: 16px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.roles-list {
  max-height: 400px;
  overflow-y: auto;
}

.role-item {
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: background-color 0.2s;
}

.role-item:hover {
  background-color: #f5f5f5;
}

.role-active {
  background-color: #e3f2fd !important;
}

.permissions-column {
  min-width: 0;
}

.permissions-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.permission-group {
  border: 1px solid #f5f5f5;
  border-bottom: none;
  margin-bottom: 12px;
}

.permission-group:last-child {
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 0;
}

.permission-group-header {
  padding: 8px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #f5f5f5;
}

.permission-group-content {
  padding: 10px 12px;
}

.permissions-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid #f5f5f5;
  border-radius: 3px;
  background-color: #fafafa;
  min-width: 110px;
  transition: all 0.2s;
}

.permission-item:hover {
  background-color: #f0f0f0;
  border-color: #e0e0e0;
}

.permission-checkbox {
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.permission-checkbox :deep(.v-checkbox) {
  margin: 0;
  padding: 0;
}

.permission-checkbox :deep(.v-selection-control) {
  min-height: 20px;
  padding: 0;
}

.permission-checkbox :deep(.v-selection-control__input) {
  width: 18px;
  height: 18px;
}

.permission-checkbox :deep(.v-selection-control__wrapper) {
  margin: 0;
}

.permission-label {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.permission-label .v-icon {
  font-size: 14px !important;
}

.permission-label span {
  font-size: 12px !important;
  line-height: 1.2;
}

:deep(.v-card) {
  box-shadow: none !important;
}

:deep(.v-btn-toggle) {
  border: 1px solid #f5f5f5 !important;
}

:deep(.v-btn-toggle .v-btn) {
  border-color: #f5f5f5 !important;
}

:deep(.v-autocomplete .v-field) {
  border: 1px solid #f5f5f5 !important;
}

:deep(.v-list-item) {
  min-height: 36px !important;
  padding: 4px 8px !important;
}
</style>
