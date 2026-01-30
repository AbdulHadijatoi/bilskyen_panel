<template>
  <div class="constants-container">
    <!-- Header -->
    <div class="constants-header">
      <div class="header-content">
        <h1 class="page-title">Constants Management</h1>
        <p class="page-subtitle">Manage vehicle-related constants and configurations</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs-wrapper">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <v-card elevation="1" class="content-card">
      <div class="content-container">
        <div class="content-header">
          <div class="search-wrapper">
            <v-icon class="search-icon">mdi-magnify</v-icon>
            <input
              v-model="searchQueries[activeTab]"
              type="text"
              class="search-input"
              :placeholder="`Search ${getCurrentTab()?.label.toLowerCase() || ''}...`"
            />
          </div>
          <button
            class="create-button"
            @click="handleCreateClick"
          >
            <v-icon size="18">mdi-plus</v-icon>
            <span>Add New</span>
          </button>
        </div>

        <div class="content-body">
          <ConstantList
            :items="getItemsForTab(activeTab)"
            :loading="loadingStates[activeTab]"
            :error="errors[activeTab]"
            :title="getCurrentTab()?.label || ''"
            :search-query="searchQueries[activeTab]"
            :show-brand="getCurrentTab()?.showBrand || false"
            :show-equipment-type="getCurrentTab()?.showEquipmentType || false"
            @edit="(item) => handleEditClick(item)"
            @delete="(id) => handleDeleteClick(id)"
          />
        </div>
      </div>
    </v-card>

    <!-- Create/Edit Dialog -->
    <ConstantForm
      v-model="showDialog"
      :title="currentTab?.label || ''"
      :editing-item="editingItem"
      :loading="saving"
      :brands="constantsData?.brands || []"
      :equipment-types="constantsData?.equipment_types || []"
      :show-brand="currentTab?.showBrand || false"
      :show-equipment-type="currentTab?.showEquipmentType || false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getConstantsData,
  getBrands,
  getModelYears,
  getFuelTypes,
  getGearTypes,
  getListingTypes,
  getBodyTypes,
  getColors,
  getVariants,
  getTypes,
  getConditions,
  getSalesTypes,
  getPriceTypes,
  getEuronorms,
  getVehicleModels,
  getVehicleUses,
  getVehicleListStatuses,
  getEquipmentTypes,
  getEquipments,
  createBrand,
  updateBrand,
  deleteBrand,
  createModelYear,
  updateModelYear,
  deleteModelYear,
  createFuelType,
  updateFuelType,
  deleteFuelType,
  createGearType,
  updateGearType,
  deleteGearType,
  createListingType,
  updateListingType,
  deleteListingType,
  createBodyType,
  updateBodyType,
  deleteBodyType,
  createColor,
  updateColor,
  deleteColor,
  createVariant,
  updateVariant,
  deleteVariant,
  createType,
  updateType,
  deleteType,
  createCondition,
  updateCondition,
  deleteCondition,
  createSalesType,
  updateSalesType,
  deleteSalesType,
  createPriceType,
  updatePriceType,
  deletePriceType,
  createEuronorm,
  updateEuronorm,
  deleteEuronorm,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  createVehicleUse,
  updateVehicleUse,
  deleteVehicleUse,
  createVehicleListStatus,
  updateVehicleListStatus,
  deleteVehicleListStatus,
  createEquipmentType,
  updateEquipmentType,
  deleteEquipmentType,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  type ConstantModel,
  type VehicleModelConstant,
  type EquipmentConstant,
  type ConstantsData,
  type CreateConstantData,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import ConstantList from './components/ConstantList.vue'
import ConstantForm from './components/ConstantForm.vue'

interface TabConfig {
  key: string
  label: string
  showBrand?: boolean
  showEquipmentType?: boolean
  getItems: (data: ConstantsData) => (ConstantModel | VehicleModelConstant | EquipmentConstant)[]
  loadItems: () => Promise<any>
  create: (data: any) => Promise<any>
  update: (id: number | string, data: CreateConstantData) => Promise<any>
  delete: (id: number | string) => Promise<void>
}

const tabs: TabConfig[] = [
  {
    key: 'brands',
    label: 'Brands',
    getItems: (data) => data.brands,
    loadItems: getBrands,
    create: createBrand,
    update: updateBrand,
    delete: deleteBrand,
  },
  {
    key: 'model_years',
    label: 'Model Years',
    getItems: (data) => data.model_years,
    loadItems: getModelYears,
    create: createModelYear,
    update: updateModelYear,
    delete: deleteModelYear,
  },
  {
    key: 'fuel_types',
    label: 'Fuel Types',
    getItems: (data) => data.fuel_types,
    loadItems: getFuelTypes,
    create: createFuelType,
    update: updateFuelType,
    delete: deleteFuelType,
  },
  {
    key: 'gear_types',
    label: 'Gear Types',
    getItems: (data) => data.gear_types,
    loadItems: getGearTypes,
    create: createGearType,
    update: updateGearType,
    delete: deleteGearType,
  },
  {
    key: 'listing_types',
    label: 'Listing Types',
    getItems: (data) => data.listing_types,
    loadItems: getListingTypes,
    create: createListingType,
    update: updateListingType,
    delete: deleteListingType,
  },
  {
    key: 'body_types',
    label: 'Body Types',
    getItems: (data) => data.body_types,
    loadItems: getBodyTypes,
    create: createBodyType,
    update: updateBodyType,
    delete: deleteBodyType,
  },
  {
    key: 'colors',
    label: 'Colors',
    getItems: (data) => data.colors,
    loadItems: getColors,
    create: createColor,
    update: updateColor,
    delete: deleteColor,
  },
  {
    key: 'variants',
    label: 'Variants',
    getItems: (data) => data.variants,
    loadItems: getVariants,
    create: createVariant,
    update: updateVariant,
    delete: deleteVariant,
  },
  {
    key: 'types',
    label: 'Types',
    getItems: (data) => data.types,
    loadItems: getTypes,
    create: createType,
    update: updateType,
    delete: deleteType,
  },
  {
    key: 'conditions',
    label: 'Conditions',
    getItems: (data) => data.conditions,
    loadItems: getConditions,
    create: createCondition,
    update: updateCondition,
    delete: deleteCondition,
  },
  {
    key: 'sales_types',
    label: 'Sales Types',
    getItems: (data) => data.sales_types,
    loadItems: getSalesTypes,
    create: createSalesType,
    update: updateSalesType,
    delete: deleteSalesType,
  },
  {
    key: 'price_types',
    label: 'Price Types',
    getItems: (data) => data.price_types,
    loadItems: getPriceTypes,
    create: createPriceType,
    update: updatePriceType,
    delete: deletePriceType,
  },
  {
    key: 'euronorms',
    label: 'Euronorms',
    getItems: (data) => data.euronorms,
    loadItems: getEuronorms,
    create: createEuronorm,
    update: updateEuronorm,
    delete: deleteEuronorm,
  },
  {
    key: 'vehicle_models',
    label: 'Vehicle Models',
    showBrand: true,
    getItems: (data) => data.vehicle_models,
    loadItems: getVehicleModels,
    create: createVehicleModel,
    update: updateVehicleModel,
    delete: deleteVehicleModel,
  },
  {
    key: 'vehicle_uses',
    label: 'Vehicle Uses',
    getItems: (data) => data.vehicle_uses,
    loadItems: getVehicleUses,
    create: createVehicleUse,
    update: updateVehicleUse,
    delete: deleteVehicleUse,
  },
  {
    key: 'vehicle_list_statuses',
    label: 'Vehicle List Statuses',
    getItems: (data) => data.vehicle_list_statuses,
    loadItems: getVehicleListStatuses,
    create: createVehicleListStatus,
    update: updateVehicleListStatus,
    delete: deleteVehicleListStatus,
  },
  {
    key: 'equipment_types',
    label: 'Equipment Types',
    getItems: (data) => data.equipment_types,
    loadItems: getEquipmentTypes,
    create: createEquipmentType,
    update: updateEquipmentType,
    delete: deleteEquipmentType,
  },
  {
    key: 'equipments',
    label: 'Equipments',
    showEquipmentType: true,
    getItems: (data) => data.equipments,
    loadItems: getEquipments,
    create: createEquipment,
    update: updateEquipment,
    delete: deleteEquipment,
  },
]

const activeTab = ref('brands')
const constantsData = ref<ConstantsData | null>(null)
const loadingStates = ref<Record<string, boolean>>({})
const errors = ref<Record<string, string | null>>({})
const searchQueries = ref<Record<string, string>>({})
const showDialog = ref(false)
const saving = ref(false)
const currentTab = ref<TabConfig | null>(null)
const editingItem = ref<ConstantModel | VehicleModelConstant | EquipmentConstant | null>(null)

// Initialize search queries
tabs.forEach(tab => {
  searchQueries.value[tab.key] = ''
  loadingStates.value[tab.key] = false
  errors.value[tab.key] = null
})

const getCurrentTab = () => {
  return tabs.find(t => t.key === activeTab.value)
}

const getItemsForTab = (tabKey: string) => {
  const tab = tabs.find(t => t.key === tabKey)
  if (!tab || !constantsData.value) return []
  return tab.getItems(constantsData.value)
}

const handleCreateClick = () => {
  const tab = getCurrentTab()
  if (tab) {
    openCreateDialog(tab)
  }
}

const handleEditClick = (item: ConstantModel | VehicleModelConstant | EquipmentConstant) => {
  const tab = getCurrentTab()
  if (tab) {
    openEditDialog(tab, item)
  }
}

const handleDeleteClick = (id: number) => {
  const tab = getCurrentTab()
  if (tab) {
    handleDelete(tab, id)
  }
}

const loadConstantsData = async () => {
  try {
    loadingStates.value['all'] = true
    constantsData.value = await getConstantsData()
  } catch (err) {
    console.error('Failed to load constants data:', err)
  } finally {
    loadingStates.value['all'] = false
  }
}

const openCreateDialog = (tab: TabConfig) => {
  currentTab.value = tab
  editingItem.value = null
  showDialog.value = true
}

const openEditDialog = (tab: TabConfig, item: ConstantModel | VehicleModelConstant | EquipmentConstant) => {
  currentTab.value = tab
  editingItem.value = item
  showDialog.value = true
}

const handleSubmit = async (data: CreateConstantData) => {
  if (!currentTab.value) return

  try {
    saving.value = true
    if (editingItem.value) {
      await currentTab.value.update(editingItem.value.id, data)
    } else {
      await currentTab.value.create(data)
    }
    showDialog.value = false
    editingItem.value = null
    // Reload constants data to refresh cache
    await loadConstantsData()
  } catch (err) {
    const error = err as ApiErrorModel
    if (currentTab.value) {
      errors.value[currentTab.value.key] = error.message || 'Failed to save'
    }
  } finally {
    saving.value = false
  }
}

const handleDelete = async (tab: TabConfig, id: number) => {
  if (!confirm(`Are you sure you want to delete this ${tab.label.toLowerCase()}?`)) return

  try {
    loadingStates.value[tab.key] = true
    await tab.delete(id)
    // Reload constants data to refresh cache
    await loadConstantsData()
  } catch (err) {
    const error = err as ApiErrorModel
    errors.value[tab.key] = error.message || 'Failed to delete'
  } finally {
    loadingStates.value[tab.key] = false
  }
}

onMounted(() => {
  loadConstantsData()
})
</script>

<style scoped>
.constants-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

/* Header */
.constants-header {
  padding: 2rem 0 1.5rem;
  border-bottom: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  color: var(--foreground);
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  font-weight: 400;
}

/* Tabs */
.tabs-container {
  border-bottom: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
  background: var(--background);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-wrapper {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-wrapper::-webkit-scrollbar {
  display: none;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  position: relative;
}

.tab-button:hover {
  color: var(--foreground);
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.tab-button.active {
  color: rgb(var(--v-theme-primary));
  border-bottom-color: rgb(var(--v-theme-primary));
  background: transparent;
}

/* Content Card */
.content-card {
  overflow: hidden;
}

/* Content */
.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.75rem;
  border: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: rgba(var(--v-theme-on-surface), 0.01);
  color: var(--foreground);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-on-surface), 0.02);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.search-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.create-button:active {
  transform: translateY(0);
}

.content-body {
  flex: 1;
  min-height: 0;
}
</style>
