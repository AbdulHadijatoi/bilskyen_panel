<template>
  <div class="panel-page">
    <!-- Header -->
    <PageHeader
      :title="t('staff.views.leads.title')"
      :subtitle="t('staff.views.leads.subtitle')"
    >
      <template #actions>
        <div class="panel-inline-actions w-100 w-md-auto">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          density="compact"
          class="panel-segmented-toggle flex-grow-1 flex-md-grow-0"
        >
          <v-btn value="kanban" prepend-icon="mdi-view-column">
            <span class="d-none d-sm-inline">{{ t('staff.views.leads.kanban') }}</span>
          </v-btn>
          <v-btn value="table" prepend-icon="mdi-table">
            <span class="d-none d-sm-inline">{{ t('staff.views.leads.table') }}</span>
          </v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="!showAnalytics"
          icon
          variant="text"
          @click="showAnalytics = true"
        >
          <v-icon>mdi-chart-box</v-icon>
        </v-btn>
        </div>
      </template>
    </PageHeader>

    <!-- Filters and Search -->
    <div class="filters-container mb-4">
      <!-- Search Bar -->
      <div class="search-section mb-3">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          :placeholder="t('staff.views.leads.searchPlaceholder')"
      variant="outlined"
          density="compact"
          hide-details
          clearable
          class="search-field"
          @update:model-value="debouncedSearch"
        />
        </div>

      <!-- Filter Chips and Controls -->
      <div class="d-flex flex-wrap align-center gap-2">
        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="d-flex flex-wrap align-center gap-1 flex-grow-1">
          <v-chip
            v-if="filterDays"
            size="small"
            closable
            @click:close="filterDays = null; applyFilters()"
          >
            <v-icon start size="small">mdi-calendar</v-icon>
            {{ daysOptions.find(d => d.value === filterDays)?.label }}
          </v-chip>
          <v-chip
            v-for="vehicleId in filterVehicles"
            :key="vehicleId"
            size="small"
            closable
            @click:close="filterVehicles = filterVehicles.filter(id => id !== vehicleId); applyFilters()"
          >
            <v-icon start size="small">mdi-car</v-icon>
            {{ vehicleOptions.find(v => v.id === vehicleId)?.title || t('staff.views.leads.vehicle') }}
          </v-chip>
          <v-chip
            v-if="filterStage"
            size="small"
            closable
            :color="getStageColor(filterStage)"
            @click:close="filterStage = null; applyFilters()"
          >
            <v-icon start size="small">mdi-filter</v-icon>
            {{ stages.find(s => s.id === filterStage)?.name }}
          </v-chip>
          <v-chip
            v-if="filterIntent"
            size="small"
            closable
            :color="getIntentColor(filterIntent)"
            @click:close="filterIntent = null; applyFilters()"
          >
            <v-icon start size="small">mdi-star</v-icon>
            {{ intentOptions.find(i => i.id === filterIntent)?.name }}
          </v-chip>
        </div>

        <!-- Filter Dropdowns -->
        <div class="d-flex flex-wrap align-center gap-2 ms-auto">
          <v-menu location="bottom start" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                size="small"
                prepend-icon="mdi-filter-variant"
                :class="{ 'text-primary': hasActiveFilters }"
              >
                {{ t('staff.views.leads.filters') }}
                <v-chip
                  v-if="activeFilterCount > 0"
                  size="x-small"
                  class="ms-1"
                  color="primary"
                >
                  {{ activeFilterCount }}
                </v-chip>
              </v-btn>
            </template>
            <v-card min-width="280" class="pa-3">
              <div class="text-subtitle-2 font-weight-bold mb-3">{{ t('staff.views.leads.filterOptions') }}</div>
              <v-select
                v-model="filterDays"
                :items="daysOptions"
                item-title="label"
                item-value="value"
                :label="t('staff.views.leads.timePeriod')"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                class="mb-3"
                @update:model-value="applyFilters"
              />
              <v-select
                v-model="filterStage"
                :items="stages"
                item-title="name"
                item-value="id"
                :label="t('staff.views.leads.stage')"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                class="mb-3"
                @update:model-value="applyFilters"
              />
              <v-select
                v-model="filterIntent"
                :items="intentOptions"
                item-title="name"
                item-value="id"
                :label="t('staff.views.leads.intent')"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                class="mb-3"
                @update:model-value="applyFilters"
              />
              <v-select
                v-model="filterVehicles"
                :items="vehicleOptions"
                item-title="title"
                item-value="id"
                :label="t('staff.views.leads.vehicles')"
                variant="outlined"
                density="compact"
                hide-details
                multiple
                chips
                clearable
                @update:model-value="applyFilters"
              />
            </v-card>
          </v-menu>

          <v-btn
            v-if="hasActiveFilters"
            variant="text"
            size="small"
            prepend-icon="mdi-close-circle"
            @click="clearAllFilters"
          >
            {{ t('staff.views.leads.clearAll') }}
          </v-btn>
        </div>
            </div>
                    </div>

    <v-row v-if="!loading && !error" class="ma-0">
      <!-- Main Content -->
      <v-col cols="12" :md="showAnalytics ? 9 : 12" class="pa-0 pa-md-2">
        <!-- Table View -->
                  <v-card
          v-if="viewMode === 'table'"
                    variant="outlined"
                    :style="{
                      backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
                      borderColor: 'var(--border)',
                    }"
                  >
                    <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="filteredLeads"
              :loading="loading"
              item-value="id"
              class="leads-table"
            >
              <template #item.name="{ item }">
                        <div>
                  <div class="font-weight-medium">{{ item.name || t('common.unknown') }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.email || item.phone || t('common.noContact') }}
                  </div>
                </div>
              </template>
              <template #item.vehicle="{ item }">
                <div v-if="item.vehicle" class="text-caption">
                  {{ item.vehicle.title || item.vehicle.registration || t('common.na') }}
                        </div>
                <div v-else class="text-medium-emphasis">{{ t('staff.views.leads.noVehicle') }}</div>
              </template>
              <template #item.stageId="{ item }">
                <v-chip
                  size="small"
                  variant="flat"
                  :color="getStageColor(item.stageId)"
                >
                  {{ getStageName(item.stageId) }}
                </v-chip>
              </template>
              <template #item.intentId="{ item }">
                <v-chip
                  v-if="item.intentId"
                  size="small"
                  variant="flat"
                  :color="getIntentColor(item.intentId)"
                >
                  {{ getIntentName(item.intentId) }}
                </v-chip>
                <span v-else class="text-medium-emphasis">{{ t('staff.views.leads.notSet') }}</span>
              </template>
              <template #item.categoryId="{ item }">
                <v-chip
                  v-if="item.categoryId"
                  size="small"
                  variant="outlined"
                >
                  {{ getCategoryName(item.categoryId) }}
                </v-chip>
                <span v-else class="text-medium-emphasis">{{ t('staff.views.leads.notSet') }}</span>
              </template>
              <template #item.createdAt="{ item }">
                {{ formatLeadDate(item.createdAt) }}
              </template>
              <template #item.actions="{ item }">
                        <v-menu>
                          <template #activator="{ props }">
                            <v-btn icon variant="text" size="small" v-bind="props">
                              <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                          </template>
                          <v-list>
                    <v-list-item @click="viewLead(item.id)">
                              <v-list-item-title>{{ t('staff.views.leads.viewDetails') }}</v-list-item-title>
                            </v-list-item>
                    <v-list-item @click="assignLead(item)">
                              <v-list-item-title>{{ t('staff.views.leads.assign') }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
              </template>
            </v-data-table>
                    </v-card-text>
                  </v-card>

        <!-- Kanban View -->
        <v-card
          v-if="viewMode === 'kanban'"
          variant="outlined"
          :style="{
            backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
            borderColor: 'var(--border)',
          }"
        >
          <v-card-text>
            <div class="d-flex gap-4 overflow-x-auto kanban-container" style="min-height: 600px;">
              <div
                v-for="stage in stages"
                :key="stage.id"
                class="flex-shrink-0 kanban-column"
                style="width: 320px;"
              >
                <div class="d-flex justify-space-between align-center mb-3">
                  <div class="d-flex align-center gap-2">
                    <h3 class="text-subtitle-1 font-weight-bold">{{ stage.name }}</h3>
                    <v-chip size="small" variant="flat" :color="getStageColor(stage.id)">
                      {{ getLeadsByStage(stage.id).length }}
                    </v-chip>
                  </div>
                </div>
                <v-card
                  variant="outlined"
                  class="kanban-column-card"
                  :style="{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    minHeight: '500px',
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                  }"
                >
                  <v-card-text class="pa-2">
                    <div
                      :ref="(el) => setStageListRef(el, stage.id)"
                      :data-stage-id="stage.id"
                      class="draggable-list"
                      :class="{ 'empty-list': getLeadsByStage(stage.id).length === 0 }"
                    >
                      <!-- Always present placeholder for SortableJS to use as reference -->
                      <!-- This prevents "lastElementChild" null errors when dragging over empty lists -->
                      <!-- The placeholder is always in DOM but hidden when list has items -->
                      <div 
                        class="sortable-placeholder"
                        :style="{
                          height: getLeadsByStage(stage.id).length === 0 ? '20px' : '1px',
                          minHeight: getLeadsByStage(stage.id).length === 0 ? '20px' : '1px',
                          opacity: getLeadsByStage(stage.id).length === 0 ? '0' : '0',
                          pointerEvents: 'none',
                          flexShrink: 0,
                          margin: 0,
                          padding: 0
                        }"
                        aria-hidden="true"
                      ></div>
                      <!-- Empty state - not draggable, just visual -->
                      <div 
                        v-if="getLeadsByStage(stage.id).length === 0" 
                        class="empty-state-placeholder"
                        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1;"
                      >
                        <div class="text-center text-medium-emphasis py-8">
                          <v-icon size="48" color="grey-lighten-1">mdi-inbox-outline</v-icon>
                          <div class="mt-2">{{ t('staff.views.leads.noLeadsInStage') }}</div>
                        </div>
                      </div>
                      <!-- Draggable items -->
                      <template v-for="lead in getLeadsByStage(stage.id)" :key="`lead-${lead.id}`">
                        <div :data-lead-id="lead.id" class="draggable-item">
                          <LeadCard
                            :lead="lead"
                            class="mb-2"
                            @view="viewLead"
                            @assign="assignLead"
                            @change-intent="changeIntent"
                            @change-category="changeCategory"
                          />
                        </div>
                      </template>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>

      </v-col>

      <!-- Analytics Sidebar -->
      <v-col v-if="showAnalytics" cols="12" md="3" class="pa-0 pa-md-2 mt-4 mt-md-0">
        <AnalyticsSidebar
          :leads="leads"
          :loading="loading"
          @toggle="showAnalytics = false"
        />
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading && !leads.length" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal">
        {{ error }}
      </v-alert>
    </div>

    <!-- Assign Lead Dialog -->
    <v-dialog v-model="assignDialog" max-width="500">
      <v-card>
        <v-card-title>{{ t('staff.views.leads.assignLead') }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStaffId"
            :items="staffMembers"
            item-title="name"
            item-value="id"
            :label="t('staff.views.leads.assignToStaff')"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="assignDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" @click="handleAssignLead">{{ t('staff.views.leads.assign') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Intent Dialog -->
    <v-dialog v-model="intentDialog" max-width="400">
      <v-card>
        <v-card-title>{{ t('staff.views.leads.changeIntent') }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedIntentId"
            :items="intentOptions"
            item-title="name"
            item-value="id"
            :label="t('staff.views.leads.selectIntent')"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="intentDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" @click="handleChangeIntent">{{ t('staff.views.leads.update') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="400">
      <v-card>
        <v-card-title>{{ t('staff.views.leads.changeCategory') }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedCategoryId"
            :items="categoryOptions"
            item-title="name"
            item-value="id"
            :label="t('staff.views.leads.selectCategory')"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="categoryDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" @click="handleChangeCategory">{{ t('staff.views.leads.update') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">{{ t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
// All reactive variables are defined below and automatically available in template
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { useKanbanSortable } from '@/composables/useKanbanSortable'
import { getLeads, assignLead as assignLeadApi, getStaff, updateLeadStage, updateLeadIntent, updateLeadCategory, getVehicles } from '@/api/staff.api'
import type { VehicleModel } from '@/models/vehicle.model'
import type { LeadModel } from '@/models/lead.model'
import { LeadStage } from '@/models/lead.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import {
  getStageName,
  getStageColor,
  getIntentName,
  getIntentColor,
  getCategoryName,
  formatLeadDate,
  getStageOptions,
  getIntentOptions,
  getCategoryOptions,
} from '@/utils/leadHelpers'
import LeadCard from '@/components/staff/LeadCard.vue'
import AnalyticsSidebar from '@/components/staff/AnalyticsSidebar.vue'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const leads = ref<LeadModel[]>([])
const staffMembers = ref<any[]>([])
const vehicles = ref<VehicleModel[]>([])
const viewMode = ref<'kanban' | 'table'>('kanban')
const showAnalytics = ref(true)
const searchQuery = ref('')
const filterDays = ref<number | null>(null)
const filterVehicles = ref<number[]>([])
const filterStage = ref<number | null>(null)
const filterIntent = ref<number | null>(null)
const assignDialog = ref(false)
const intentDialog = ref(false)
const categoryDialog = ref(false)
const selectedLead = ref<LeadModel | null>(null)
const selectedStaffId = ref<number | null>(null)
const selectedIntentId = ref<number | null>(null)
const selectedCategoryId = ref<number | null>(null)

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error',
})

const stages = getStageOptions()
const stagesRef = computed(() => stages)
const intentOptions = getIntentOptions()
const categoryOptions = getCategoryOptions()

// Computed properties for filter UI
const hasActiveFilters = computed(() => {
  return !!(filterDays.value || 
    (filterVehicles.value && filterVehicles.value.length > 0) || 
    filterStage.value || 
    filterIntent.value)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterDays.value) count++
  if (filterVehicles.value && filterVehicles.value.length > 0) count += filterVehicles.value.length
  if (filterStage.value) count++
  if (filterIntent.value) count++
  return count
})

const clearAllFilters = () => {
  filterDays.value = null
  filterVehicles.value = []
  filterStage.value = null
  filterIntent.value = null
  applyFilters()
}

// Days filter options
const daysOptions = computed(() => [
  { label: t('staff.views.leads.daysOptions.oneDay'), value: 1 },
  { label: t('staff.views.leads.daysOptions.threeDays'), value: 3 },
  { label: t('staff.views.leads.daysOptions.oneWeek'), value: 7 },
  { label: t('staff.views.leads.daysOptions.twoWeeks'), value: 14 },
  { label: t('staff.views.leads.daysOptions.oneMonth'), value: 30 },
  { label: t('staff.views.leads.daysOptions.twoMonths'), value: 60 },
  { label: t('staff.views.leads.daysOptions.threeMonths'), value: 90 },
  { label: t('staff.views.leads.daysOptions.fourMonths'), value: 120 },
  { label: t('staff.views.leads.daysOptions.fiveMonths'), value: 150 },
  { label: t('staff.views.leads.daysOptions.sixMonths'), value: 180 },
  { label: t('staff.views.leads.daysOptions.sevenMonths'), value: 210 },
  { label: t('staff.views.leads.daysOptions.eightMonths'), value: 240 },
  { label: t('staff.views.leads.daysOptions.nineMonths'), value: 270 },
  { label: t('staff.views.leads.daysOptions.tenMonths'), value: 300 },
  { label: t('staff.views.leads.daysOptions.elevenMonths'), value: 330 },
  { label: t('staff.views.leads.daysOptions.oneYear'), value: 365 },
])

// Vehicle options for filter
const vehicleOptions = computed(() => {
  return vehicles.value.map(vehicle => ({
    id: vehicle.id,
    title: vehicle.title || vehicle.registration || t('staff.views.leads.vehicle') + ' #' + vehicle.id,
  }))
})

// Filtered leads computed property - must be defined before it's used
const filteredLeads = computed(() => {
  let filtered = [...leads.value]
  
  // Apply days filter
  if (filterDays.value) {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - filterDays.value)
    filtered = filtered.filter(lead => {
      if (!lead.createdAt) return false
      const leadDate = new Date(lead.createdAt)
      return leadDate >= daysAgo
    })
  }
  
  // Apply vehicle filter
  if (filterVehicles.value && filterVehicles.value.length > 0) {
    filtered = filtered.filter(lead => 
      lead.vehicleId && filterVehicles.value.includes(lead.vehicleId)
    )
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(lead =>
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.vehicle?.title?.toLowerCase().includes(query) ||
      lead.message?.toLowerCase().includes(query)
    )
  }
  
  // Apply stage filter
  if (filterStage.value) {
    filtered = filtered.filter(lead => lead.stageId === filterStage.value)
  }
  
  // Apply intent filter
  if (filterIntent.value) {
    filtered = filtered.filter(lead => lead.intentId === filterIntent.value)
  }
  
  return filtered
})

// Create reactive stage leads for drag and drop
const stageLeads = ref<Record<number, LeadModel[]>>({})
const isDragging = ref(false)

const handleKanbanStageDrop = async ({
  leadId,
  oldStageId,
  newStageId,
  newIndex,
  oldIndex,
}: {
  leadId: number
  oldStageId: number
  newStageId: number
  newIndex: number | undefined
  oldIndex: number | undefined
}) => {
  const lead = leads.value.find((l) => l.id === leadId)
  if (!lead) {
    return
  }

  const newStageName = getStageName(newStageId)
  const oldStageLeads = stageLeads.value[oldStageId] || []
  const newStageLeads = stageLeads.value[newStageId] || []

  const leadIndex = oldStageLeads.findIndex((l) => l.id === leadId)
  if (leadIndex !== -1) {
    oldStageLeads.splice(leadIndex, 1)
  }

  if (newIndex !== undefined && newIndex >= 0) {
    newStageLeads.splice(newIndex, 0, lead)
  } else {
    newStageLeads.push(lead)
  }

  try {
    loading.value = true
    const updatedLead = await updateLeadStage(lead.id, { stage_id: newStageId })

    if (updatedLead?.stageId !== undefined) {
      lead.stageId = updatedLead.stageId
    } else {
      lead.stageId = newStageId
    }

    snackbar.value = {
      show: true,
      message: t('staff.views.leads.leadMovedTo', { name: newStageName }),
      color: 'success',
    }
  } catch (err) {
    const revertIndex = newStageLeads.findIndex((l) => l.id === leadId)
    if (revertIndex !== -1) {
      newStageLeads.splice(revertIndex, 1)
    }
    if (oldIndex !== undefined && oldIndex >= 0 && oldIndex <= oldStageLeads.length) {
      oldStageLeads.splice(oldIndex, 0, lead)
    } else {
      oldStageLeads.push(lead)
    }
    lead.stageId = oldStageId

    await nextTick()
    await initializeSortable()

    snackbar.value = {
      show: true,
      message: (err as ApiErrorModel).message || t('staff.views.leads.failedUpdateStage'),
      color: 'error',
    }

    await loadLeads()
  } finally {
    loading.value = false
  }
}

const { setStageListRef, initializeSortable } = useKanbanSortable({
  viewMode,
  stages: stagesRef,
  isDragging,
  onStageDrop: handleKanbanStageDrop,
})

// Initialize stage leads from filtered leads
const initializeStageLeads = async () => {
  // Create a new object to trigger reactivity
  const newStageLeads: Record<number, LeadModel[]> = {}
  
  // Initialize all stages first
  stages.forEach(stage => {
    newStageLeads[stage.id] = []
  })
  
  // Then populate with filtered leads - create new array references for reactivity
  stages.forEach(stage => {
    const stageLeadsArray = filteredLeads.value.filter(lead => lead.stageId === stage.id)
    newStageLeads[stage.id] = [...stageLeadsArray] // New array reference
  })
  
  // Replace the entire object to ensure reactivity
  stageLeads.value = newStageLeads
  
  // Initialize Sortable after stage leads are set
  await initializeSortable()
}

// Watch filtered leads and update stage leads
// Skip re-initialization during drag operations to prevent blinking
watch(filteredLeads, async () => {
  if (!isDragging.value) {
    await initializeStageLeads()
  }
}, { deep: true, immediate: true })

// Watch viewMode to initialize Sortable when switching to kanban
watch(viewMode, async (newMode) => {
  if (newMode === 'kanban') {
    await nextTick()
    await initializeSortable()
  }
})

const getLeadsByStage = (stageId: number) => {
  // Ensure the array exists and is reactive
  if (!stageLeads.value[stageId]) {
    stageLeads.value[stageId] = []
  }
  // Return the actual reactive array reference
  return stageLeads.value[stageId]
}

// Create a helper to get stage leads array for draggable (ensures reactivity)
const getStageLeadsList = (stageId: number) => {
  return computed(() => {
    if (!stageLeads.value[stageId]) {
      return []
    }
    return stageLeads.value[stageId]
  })
}

const debouncedSearch = useDebounceFn(() => {
  // Search is handled by computed property
}, 300)

const tableHeaders = computed(() => [
  { title: t('staff.views.leads.customer'), key: 'name', sortable: true },
  { title: t('staff.views.leads.vehicle'), key: 'vehicle', sortable: false },
  { title: t('staff.views.leads.stage'), key: 'stageId', sortable: true },
  { title: t('staff.views.leads.intent'), key: 'intentId', sortable: true },
  { title: t('staff.views.leads.category'), key: 'categoryId', sortable: true },
  { title: t('staff.views.leads.date'), key: 'createdAt', sortable: true },
  { title: t('staff.views.leads.actions'), key: 'actions', sortable: false, align: 'end' as const },
])

const viewLead = (leadId: number) => {
  router.push({ name: 'staff.leads.detail', params: { id: leadId } })
}

const assignLead = (lead: LeadModel) => {
  selectedLead.value = lead
  assignDialog.value = true
}

const changeIntent = (lead: LeadModel) => {
  selectedLead.value = lead
  selectedIntentId.value = lead.intentId || null
  intentDialog.value = true
}

const changeCategory = (lead: LeadModel) => {
  selectedLead.value = lead
  selectedCategoryId.value = lead.categoryId || null
  categoryDialog.value = true
}

const handleAssignLead = async () => {
  if (!selectedLead.value || !selectedStaffId.value) return

  try {
    loading.value = true
    await assignLeadApi(selectedLead.value.id, { assigned_to_id: selectedStaffId.value })
    await loadLeads()
    assignDialog.value = false
    selectedLead.value = null
    selectedStaffId.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('staff.views.leads.failedAssignLead')
  } finally {
    loading.value = false
  }
}

const handleChangeIntent = async () => {
  if (!selectedLead.value || !selectedIntentId.value) return

  try {
    loading.value = true
    await updateLeadIntent(selectedLead.value.id, { intent_id: selectedIntentId.value })
    await loadLeads()
    intentDialog.value = false
    selectedLead.value = null
    selectedIntentId.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('staff.views.leads.failedUpdateIntent')
  } finally {
    loading.value = false
  }
}

const handleChangeCategory = async () => {
  if (!selectedLead.value || !selectedCategoryId.value) return

  try {
    loading.value = true
    await updateLeadCategory(selectedLead.value.id, { category_id: selectedCategoryId.value })
    await loadLeads()
    categoryDialog.value = false
    selectedLead.value = null
    selectedCategoryId.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('staff.views.leads.failedUpdateCategory')
  } finally {
    loading.value = false
  }
}


const applyFilters = () => {
  // Filters are applied via computed property
}

const loadLeads = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getLeads({ page: 1, limit: 100 })
    leads.value = response.docs
    // Wait for next tick to ensure filteredLeads is computed
    await nextTick()
    // initializeStageLeads will be called by the watch on filteredLeads
    // But we also call it explicitly to ensure it runs
    initializeStageLeads()
    // Force another update after initialization
    await nextTick()
  } catch (err) {
    const apiError = err as ApiErrorModel
    error.value = apiError?.message || t('staff.views.leads.failedLoadLeads')
  } finally {
    loading.value = false
  }
}

const loadStaff = async () => {
  try {
    const staff = await getStaff()
    staffMembers.value = staff.map((s: any) => ({
      id: s.user_id || s.user?.id,
      name: s.user?.name || t('common.unknown'),
    }))
  } catch (err) {
    console.error('Failed to load staff:', err)
  }
}

const loadVehicles = async () => {
  try {
    const response = await getVehicles({ page: 1, limit: 1000 })
    vehicles.value = response.docs
  } catch (err) {
    console.error('Failed to load vehicles:', err)
  }
}

onMounted(async () => {
  await Promise.all([loadLeads(), loadStaff(), loadVehicles()])
  await nextTick()
  await initializeSortable()
})
</script>

<style scoped>
.filters-container {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.search-section {
  position: relative;
}

.search-field {
  max-width: 100%;
}

.search-field :deep(.v-field) {
  background: var(--background);
}

/* Active filter chips */
.filters-container :deep(.v-chip) {
  font-size: 0.75rem;
  height: 28px;
}

/* Filter menu button */
.filters-container :deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .filters-container {
    padding: 12px;
  }
  
  .search-field {
    margin-bottom: 12px;
  }
}
.cursor-pointer {
  cursor: pointer;
}

.kanban-container {
  padding: 8px;
  scroll-behavior: smooth;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.kanban-column-card {
  flex: 1;
  transition: all 0.2s ease;
}

.kanban-column-card:hover {
  border-color: var(--primary);
}

.lead-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  cursor: grab;
}

.lead-card:active {
  cursor: grabbing;
}

.lead-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: var(--primary);
}

.ghost-card {
  opacity: 0.4;
  background: var(--muted);
  transform: rotate(2deg);
}

.chosen-card {
  cursor: grabbing !important;
  opacity: 0.9;
}

.drag-card {
  opacity: 0.6;
  transform: rotate(3deg) scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.draggable-list {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.draggable-list.empty-list {
  min-height: 200px;
}

.empty-state-placeholder {
  pointer-events: none;
  user-select: none;
  z-index: 1;
}

.sortable-placeholder {
  flex-shrink: 0;
}

.draggable-item-wrapper {
  width: 100%;
}

.draggable-item {
  cursor: grab;
  width: 100%;
}

.draggable-item:active {
  cursor: grabbing;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .kanban-column {
    width: 280px !important;
  }
  
  /* Ensure proper stacking on mobile */
  .v-row {
    margin: 0 !important;
    flex-direction: column;
  }
  
  .v-col {
    padding: 8px !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}

@media (max-width: 600px) {
  .kanban-container {
    flex-direction: column;
  }
  
  .kanban-column {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  /* Mobile table adjustments */
  .v-data-table {
    font-size: 0.875rem;
  }
  
  .v-data-table :deep(th),
  .v-data-table :deep(td) {
    padding: 8px 4px !important;
    white-space: nowrap;
  }
  
  /* Ensure columns stack on mobile */
  .v-row {
    margin: 0 !important;
    flex-direction: column !important;
  }
  
  .v-col {
    padding: 8px !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    width: 100% !important;
  }
}

:deep(.v-data-table) {
  background-color: transparent;
}

:deep(.v-data-table__tr) {
  transition: background-color 0.2s ease;
}

:deep(.v-data-table__tr:hover) {
  background-color: var(--muted);
}

/* Smooth transitions for filters */
.v-card {
  transition: all 0.2s ease;
}

/* Analytics sidebar animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.analytics-enter {
  animation: slideIn 0.3s ease;
}
</style>
