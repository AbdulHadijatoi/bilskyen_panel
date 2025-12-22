<template>
  <div class="flex w-full flex-col gap-4">
    <div>
      <h2 class="text-xl font-bold">Permissions Management</h2>
      <p class="text-muted-foreground max-w-2xl">
        Manage permissions for users and roles. Select a user or role to view and modify their permissions.
      </p>
    </div>

    <v-divider class="my-3" />

    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- Model Selection Section -->
    <v-card>
      <v-card-title>Select User or Role</v-card-title>
      <v-card-text>
        <div class="flex flex-col gap-4">
          <!-- Model Type Selection -->
          <v-radio-group v-model="modelType" inline>
            <v-radio label="User" value="user" />
            <v-radio label="Role" value="role" />
          </v-radio-group>

          <!-- Model Search/Autocomplete -->
          <div>
            <v-autocomplete
              ref="modelSearchRef"
              v-model="selectedModel"
              :items="modelOptions"
              :loading="searchingModels"
              :search="modelSearchQuery"
              @update:search="handleModelSearchInput"
              @keydown.enter.prevent="handleModelSearch"
              item-title="name"
              item-value="id"
              label="Search and select a user or role"
              placeholder="Type to search and press Enter..."
              clearable
              return-object
              :no-filter="true"
              @update:model-value="handleModelSelect"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon>{{ modelType === 'role' ? 'mdi-shield-account' : 'mdi-account' }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.raw.email">{{ item.raw.email }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
            <div class="text-caption text-medium-emphasis mt-1 d-flex align-center">
              <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
              <span>Type your search query and press</span>
              <kbd class="mx-1 px-2 py-0.5 bg-grey-lighten-4 rounded text-caption font-weight-medium">Enter</kbd>
              <span>to search</span>
            </div>
          </div>

          <!-- Selected Model Info -->
          <v-alert v-if="selectedModel" type="info" variant="tonal" class="mt-2">
            <div class="d-flex align-center gap-2">
              <v-icon>{{ modelType === 'role' ? 'mdi-shield-account' : 'mdi-account' }}</v-icon>
              <span>
                <strong>{{ selectedModel.name }}</strong>
                <span v-if="selectedModel.email"> ({{ selectedModel.email }})</span>
              </span>
            </div>
          </v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- Filter Section -->
    <v-card v-if="isFilterApplied">
      <v-card-title>Filter Permissions</v-card-title>
      <v-card-text>
        <v-btn-toggle v-model="filterType" mandatory divided variant="outlined" color="primary">
          <v-btn value="all">All</v-btn>
          <v-btn value="assigned">Assigned</v-btn>
          <v-btn value="unassigned">Unassigned</v-btn>
        </v-btn-toggle>
      </v-card-text>
    </v-card>

    <!-- Permissions List -->
    <v-card v-if="isFilterApplied">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Permissions</span>
        <v-chip color="primary" variant="tonal">
          {{ filteredItems.length }} permission{{ filteredItems.length !== 1 ? 's' : '' }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div v-if="filteredItems.length === 0" class="text-center py-8 text-muted-foreground">
          No permissions found matching the selected filter.
        </div>
        <v-expansion-panels v-else v-model="expandedPanels" multiple>
          <v-expansion-panel
            v-for="(item, index) in filteredItems"
            :key="item.name"
            :value="index"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center gap-2">
                <v-icon>mdi-folder</v-icon>
                <span class="text-capitalize font-weight-medium">{{ formatEntityName(item.name) }}</span>
                <v-chip size="small" color="secondary" variant="tonal" class="ml-2">
                  {{ getAssignedCount(item) }}/{{ item.actions.length }}
                </v-chip>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list>
                <v-list-item
                  v-for="action in item.actions"
                  :key="action.id"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      :model-value="isPermissionAssigned(action.id)"
                      :disabled="processingItems.includes(action.id)"
                      :loading="processingItems.includes(action.id)"
                      @update:model-value="togglePermission(action)"
                      color="primary"
                      hide-details
                      density="compact"
                    />
                  </template>
                  <v-list-item-title>
                    <div class="d-flex align-center gap-2">
                      <v-icon size="small">{{ getActionIcon(action.action) }}</v-icon>
                      <span class="text-capitalize">{{ action.action }}</span>
                    </div>
                  </v-list-item-title>
                  <template v-slot:append>
                    <v-chip
                      v-if="isPermissionAssigned(action.id)"
                      size="small"
                      color="success"
                      variant="tonal"
                    >
                      Assigned
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <!-- Empty State -->
    <v-card v-else>
      <v-card-text>
        <div class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-shield-lock-outline</v-icon>
          <p class="text-h6 mb-2">Select a User or Role</p>
          <p class="text-muted-foreground">
            Choose a user or role from above to view and manage their permissions.
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '@/utils/axios'

const modelSearchRef = ref()

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
const modelType = ref<'user' | 'role'>('user')
const selectedModel = ref<ModelOption | null>(null)
const modelSearchQuery = ref('')
const modelOptions = ref<ModelOption[]>([])
const allItems = ref<PermissionItem[]>([])
const assignedPermissionIds = ref<number[]>([])
const filterType = ref<'all' | 'assigned' | 'unassigned'>('all')
const processingItems = ref<number[]>([])
const expandedPanels = ref<number[]>([])

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
  // Only update the search query, don't trigger API call
  modelSearchQuery.value = query
  
  // Clear options if query is too short
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
  
  // Expand all panels initially
  expandedPanels.value = allItems.value.map((_, index) => index)
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
    showSnackbar('Failed to revoke permission', 'error')
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
  }
  return icons[action] || 'mdi-check-circle'
}

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

// Watchers
watch(modelType, () => {
  selectedModel.value = null
  assignedPermissionIds.value = []
  modelOptions.value = []
  modelSearchQuery.value = ''
})

// Lifecycle
onMounted(() => {
  getAllItems()
})
</script>

<style scoped>
.text-muted-foreground {
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>

