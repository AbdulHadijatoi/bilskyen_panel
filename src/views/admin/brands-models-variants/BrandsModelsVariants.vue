<template>
  <div class="panel-page constants-container">
    <PageHeader
      title="Brands, models & variants"
      subtitle="Manage DMR brands, vehicle models, and variants"
    />

    <div class="panel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="['panel-tabs__btn', { 'panel-tabs__btn--active': activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div v-if="activeTab === 'vehicle_models'" class="panel-filters-grid__field">
          <span class="panel-filters-card__label">Brand</span>
          <v-select
            v-model="filterBrandId"
            :items="brandFilterItems"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            placeholder="All brands"
            @update:model-value="onFilterBrandChange"
          />
        </div>
        <template v-if="activeTab === 'variants'">
          <div class="panel-filters-grid__field">
            <span class="panel-filters-card__label">Brand</span>
            <v-select
              v-model="filterVariantBrandId"
              :items="brandFilterItems"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              placeholder="All brands"
              @update:model-value="onFilterVariantBrandChange"
            />
          </div>
          <div class="panel-filters-grid__field">
            <span class="panel-filters-card__label">Model</span>
            <v-select
              v-model="filterModelId"
              :items="variantModelFilterItems"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              placeholder="All models"
              @update:model-value="onFilterModelChange"
            />
          </div>
        </template>
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">Search</span>
          <v-text-field
            v-model="searchQueries[activeTab]"
            :placeholder="`Search ${getCurrentTab()?.label.toLowerCase() || ''}...`"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </div>
        <div class="panel-filters-grid__actions panel-filters-grid__actions--trailing">
          <button type="button" class="panel-btn panel-btn--primary" @click="handleCreateClick">
            <v-icon size="16">mdi-plus</v-icon>
            Add New
          </button>
        </div>
      </div>
    </div>

    <div class="panel-table-card">
      <div class="panel-table-card__body">
        <ConstantList
          :items="displayedItems"
          :loading="listLoading"
          :error="errors[activeTab]"
          :title="getCurrentTab()?.label || ''"
          :search-query="searchQueries[activeTab]"
          :show-brand="activeTab === 'vehicle_models'"
          :show-variant-brand-model="activeTab === 'variants'"
          @edit="(item) => handleEditClick(item)"
          @delete="(id) => handleDeleteClick(id)"
        />

        <div v-if="paginationTotalPages > 1" class="d-flex justify-center pa-4">
          <v-pagination
            v-model="paginationPage"
            :length="paginationTotalPages"
            :total-visible="7"
            density="comfortable"
            @update:model-value="onPaginationChange"
          />
        </div>
      </div>
    </div>

    <ConstantForm
      v-model="showDialog"
      :title="currentTab?.label || ''"
      :editing-item="editingItem"
      :loading="saving"
      :brands="brandsForForm"
      :equipment-types="[]"
      :vehicle-models="vehicleModelsForForm"
      :show-brand="currentTab?.key === 'vehicle_models' || currentTab?.key === 'variants'"
      :show-equipment-type="false"
      :show-model="currentTab?.key === 'variants'"
      :filter-models-by-brand="currentTab?.key === 'variants'"
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
import PageHeader from '@/components/panel/PageHeader.vue'

const PAGE_SIZE = 15
const FORM_MODEL_LIMIT = 2000
const FORM_BRAND_LIMIT = 2000
const FILTER_MODEL_LIMIT = 2000

interface TabConfig {
  key: string
  label: string
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
    create: (data: CreateConstantData) =>
      createVehicleModel(data as CreateConstantData & { brand_id: number }),
    update: updateVehicleModel,
    delete: deleteVehicleModel,
  },
  {
    key: 'variants',
    label: 'Variants',
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
const filterVariantBrandId = ref<number | null>(null)
const filterModelId = ref<number | null>(null)

const brandsForForm = ref<ConstantModel[]>([])
const vehicleModelsForForm = ref<VehicleModelConstant[]>([])
const brandFilterItems = ref<ConstantModel[]>([])
const modelFilterItems = ref<VehicleModelConstant[]>([])

const variantModelFilterItems = computed(() => {
  if (!filterVariantBrandId.value) {
    return modelFilterItems.value
  }
  return modelFilterItems.value.filter((m) => m.brand_id === filterVariantBrandId.value)
})

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
      brand_id: filterVariantBrandId.value ?? undefined,
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

function onFilterVariantBrandChange() {
  filterModelId.value = null
  variantsPage.value = 1
  void loadVariantsPage()
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
