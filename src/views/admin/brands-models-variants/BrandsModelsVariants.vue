<template>
  <div class="constants-container">
    <div class="constants-header">
      <div class="header-content">
        <h1 class="page-title">Brands, models & variants</h1>
        <p class="page-subtitle">
          Manage DMR brands, vehicle models, and variants
        </p>
      </div>
    </div>

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

    <v-card elevation="1" class="content-card">
      <div class="content-container">
        <div class="content-header">
          <div class="filters-row">
            <div v-if="activeTab === 'vehicle_models'" class="filter-field">
              <label class="filter-label">Brand</label>
              <v-select
                v-model="filterBrandId"
                :items="brandFilterItems"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                placeholder="All brands"
                class="filter-select"
                @update:model-value="onFilterBrandChange"
              />
            </div>
            <div v-if="activeTab === 'variants'" class="filter-field">
              <label class="filter-label">Model</label>
              <v-select
                v-model="filterModelId"
                :items="modelFilterItems"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                placeholder="All models"
                class="filter-select"
                @update:model-value="onFilterModelChange"
              />
            </div>
            <div class="search-wrapper">
              <v-icon class="search-icon">mdi-magnify</v-icon>
              <input
                v-model="searchQueries[activeTab]"
                type="text"
                class="search-input"
                :placeholder="`Search ${getCurrentTab()?.label.toLowerCase() || ''}...`"
              />
            </div>
          </div>
          <button class="create-button" @click="handleCreateClick">
            <v-icon size="18">mdi-plus</v-icon>
            <span>Add New</span>
          </button>
        </div>

        <div class="content-body">
          <ConstantList
            :items="displayedItems"
            :loading="listLoading"
            :error="errors[activeTab]"
            :title="getCurrentTab()?.label || ''"
            :search-query="searchQueries[activeTab]"
            :show-brand="getCurrentTab()?.showBrand || false"
            :show-equipment-type="false"
            :show-model="getCurrentTab()?.showModel || false"
            @edit="(item) => handleEditClick(item)"
            @delete="(id) => handleDeleteClick(id)"
          />
        </div>

        <div v-if="paginationTotalPages > 1" class="pagination-wrap">
          <v-pagination
            v-model="paginationPage"
            :length="paginationTotalPages"
            :total-visible="7"
            rounded
            @update:model-value="onPaginationChange"
          />
        </div>
      </div>
    </v-card>

    <ConstantForm
      v-model="showDialog"
      :title="currentTab?.label || ''"
      :editing-item="editingItem"
      :loading="saving"
      :brands="brandsForForm"
      :equipment-types="[]"
      :vehicle-models="vehicleModelsForForm"
      :show-brand="currentTab?.showBrand || false"
      :show-equipment-type="false"
      :show-model="currentTab?.showModel || false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import {
  getBrands,
  getVariants,
  getVehicleModels,
  createBrand,
  updateBrand,
  deleteBrand,
  createVariant,
  updateVariant,
  deleteVariant,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  type ConstantModel,
  type VehicleModelConstant,
  type VariantConstant,
  type CreateConstantData,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import ConstantList from '@/views/admin/constants/components/ConstantList.vue'
import ConstantForm from '@/views/admin/constants/components/ConstantForm.vue'

const PAGE_SIZE = 15
const FORM_MODEL_LIMIT = 2000
const FORM_BRAND_LIMIT = 2000
const FILTER_MODEL_LIMIT = 2000

interface TabConfig {
  key: string
  label: string
  showBrand?: boolean
  showModel?: boolean
  create: (data: CreateConstantData) => Promise<unknown>
  update: (id: number | string, data: CreateConstantData) => Promise<unknown>
  delete: (id: number | string) => Promise<void>
}

const tabs: TabConfig[] = [
  {
    key: 'brands',
    label: 'Brands',
    create: createBrand,
    update: updateBrand,
    delete: deleteBrand,
  },
  {
    key: 'vehicle_models',
    label: 'Vehicle models',
    showBrand: true,
    create: (data: CreateConstantData) =>
      createVehicleModel(data as CreateConstantData & { brand_id: number }),
    update: updateVehicleModel,
    delete: deleteVehicleModel,
  },
  {
    key: 'variants',
    label: 'Variants',
    showModel: true,
    create: createVariant,
    update: updateVariant,
    delete: deleteVariant,
  },
]

const activeTab = ref('brands')
const searchQueries = ref<Record<string, string>>({})
const errors = ref<Record<string, string | null>>({})
const showDialog = ref(false)
const saving = ref(false)
const currentTab = ref<TabConfig | null>(null)
const editingItem = ref<ConstantModel | VehicleModelConstant | VariantConstant | null>(null)

const brandsPage = ref(1)
const vehicleModelsPage = ref(1)
const variantsPage = ref(1)

const brandsDocs = ref<ConstantModel[]>([])
const vehicleModelsDocs = ref<VehicleModelConstant[]>([])
const variantsDocs = ref<VariantConstant[]>([])

const brandsTotalPages = ref(1)
const vehicleModelsTotalPages = ref(1)
const variantsTotalPages = ref(1)

const listLoading = ref(false)
const filterBrandId = ref<number | null>(null)
const filterModelId = ref<number | null>(null)

const brandsForForm = ref<ConstantModel[]>([])
const vehicleModelsForForm = ref<VehicleModelConstant[]>([])
const brandFilterItems = ref<ConstantModel[]>([])
const modelFilterItems = ref<VehicleModelConstant[]>([])

tabs.forEach((tab) => {
  searchQueries.value[tab.key] = ''
  errors.value[tab.key] = null
})

const getCurrentTab = () => tabs.find((t) => t.key === activeTab.value)

const paginationPage = computed({
  get() {
    if (activeTab.value === 'brands') return brandsPage.value
    if (activeTab.value === 'vehicle_models') return vehicleModelsPage.value
    return variantsPage.value
  },
  set(v: number) {
    if (activeTab.value === 'brands') brandsPage.value = v
    else if (activeTab.value === 'vehicle_models') vehicleModelsPage.value = v
    else variantsPage.value = v
  },
})

const paginationTotalPages = computed(() => {
  if (activeTab.value === 'brands') return brandsTotalPages.value
  if (activeTab.value === 'vehicle_models') return vehicleModelsTotalPages.value
  return variantsTotalPages.value
})

const displayedItems = computed(() => {
  if (activeTab.value === 'brands') return brandsDocs.value
  if (activeTab.value === 'vehicle_models') return vehicleModelsDocs.value
  return variantsDocs.value
})

async function loadBrandsPage() {
  listLoading.value = true
  try {
    const res = await getBrands({
      page: brandsPage.value,
      limit: PAGE_SIZE,
    })
    brandsDocs.value = res.docs
    brandsTotalPages.value = res.totalPages ?? Math.max(1, Math.ceil((res.totalDocs ?? res.total ?? 0) / PAGE_SIZE))
  } catch (err) {
    console.error(err)
    errors.value.brands = 'Failed to load brands'
  } finally {
    listLoading.value = false
  }
}

async function loadVehicleModelsPage() {
  listLoading.value = true
  try {
    const res = await getVehicleModels({
      page: vehicleModelsPage.value,
      limit: PAGE_SIZE,
      brand_id: filterBrandId.value ?? undefined,
    })
    vehicleModelsDocs.value = res.docs as VehicleModelConstant[]
    vehicleModelsTotalPages.value =
      res.totalPages ?? Math.max(1, Math.ceil((res.totalDocs ?? res.total ?? 0) / PAGE_SIZE))
  } catch (err) {
    console.error(err)
    errors.value.vehicle_models = 'Failed to load vehicle models'
  } finally {
    listLoading.value = false
  }
}

async function loadVariantsPage() {
  listLoading.value = true
  try {
    const res = await getVariants({
      page: variantsPage.value,
      limit: PAGE_SIZE,
      model_id: filterModelId.value ?? undefined,
    })
    variantsDocs.value = res.docs as VariantConstant[]
    variantsTotalPages.value =
      res.totalPages ?? Math.max(1, Math.ceil((res.totalDocs ?? res.total ?? 0) / PAGE_SIZE))
  } catch (err) {
    console.error(err)
    errors.value.variants = 'Failed to load variants'
  } finally {
    listLoading.value = false
  }
}

async function loadCurrentTabList() {
  if (activeTab.value === 'brands') await loadBrandsPage()
  else if (activeTab.value === 'vehicle_models') await loadVehicleModelsPage()
  else await loadVariantsPage()
}

async function loadFormLookups() {
  try {
    const [brandsRes, modelsRes] = await Promise.all([
      getBrands({ page: 1, limit: FORM_BRAND_LIMIT }),
      getVehicleModels({ page: 1, limit: FORM_MODEL_LIMIT }),
    ])
    brandsForForm.value = brandsRes.docs
    vehicleModelsForForm.value = modelsRes.docs as VehicleModelConstant[]
  } catch (err) {
    console.error('Failed to load form lookups:', err)
  }
}

async function loadFilterDropdowns() {
  try {
    const [brandsRes, modelsRes] = await Promise.all([
      getBrands({ page: 1, limit: FORM_BRAND_LIMIT }),
      getVehicleModels({ page: 1, limit: FILTER_MODEL_LIMIT }),
    ])
    brandFilterItems.value = brandsRes.docs
    modelFilterItems.value = modelsRes.docs as VehicleModelConstant[]
  } catch (err) {
    console.error('Failed to load filter dropdowns:', err)
  }
}

function onPaginationChange() {
  void loadCurrentTabList()
}

function onFilterBrandChange() {
  vehicleModelsPage.value = 1
  void loadVehicleModelsPage()
}

function onFilterModelChange() {
  variantsPage.value = 1
  void loadVariantsPage()
}

watch(activeTab, () => {
  void loadCurrentTabList()
})

const handleCreateClick = () => {
  const tab = getCurrentTab()
  if (tab) {
    currentTab.value = tab
    editingItem.value = null
    showDialog.value = true
  }
}

const handleEditClick = (
  item: ConstantModel | VehicleModelConstant | VariantConstant,
) => {
  const tab = getCurrentTab()
  if (tab) {
    currentTab.value = tab
    editingItem.value = item
    showDialog.value = true
  }
}

const handleDeleteClick = (id: number) => {
  const tab = getCurrentTab()
  if (tab) {
    handleDelete(tab, id)
  }
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
    await loadCurrentTabList()
    await loadFormLookups()
    await loadFilterDropdowns()
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
    listLoading.value = true
    await tab.delete(id)
    await loadCurrentTabList()
    await loadFormLookups()
    await loadFilterDropdowns()
  } catch (err) {
    const error = err as ApiErrorModel
    errors.value[tab.key] = error.message || 'Failed to delete'
  } finally {
    listLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadFilterDropdowns(), loadFormLookups(), loadBrandsPage()])
})
</script>

<style scoped>
.constants-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

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

.content-card {
  overflow: hidden;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 1.5rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters-row {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  min-width: 0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 180px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.filter-select {
  max-width: 280px;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
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
  flex-shrink: 0;
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 1rem 0 1.5rem;
}
</style>
