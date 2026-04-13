<template>
  <div class="vehicle-spec-definitions">
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Vehicle spec definitions</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Catalog spec name and value by brand, model, optional variants (multi-select), and inclusive model year range.
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="default"
          elevation="2"
          @click="openCreate"
        >
          Create
        </v-btn>
      </div>
    </div>

    <v-card variant="flat" class="filters-card mb-4" elevation="0">
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-4 flex-wrap">
          <v-text-field
            v-model="searchInput"
            placeholder="Search spec name or value..."
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            style="max-width: 360px"
            hide-details
            clearable
            @keyup.enter="applySearch"
          />

          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-filter-check"
            @click="applySearch"
          >
            Search
          </v-btn>

          <v-select
            v-model="limit"
            :items="pageSizeOptions"
            item-title="label"
            item-value="value"
            label="Rows"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-format-list-numbered"
            style="max-width: 140px"
            hide-details
            @update:model-value="handlePageSizeChange"
          />

          <v-spacer />

          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            :loading="loading"
            @click="loadRows"
          >
            Refresh
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="flat" class="table-card" elevation="0">
      <v-card-title class="card-title d-flex align-center">
        <v-icon class="mr-2">mdi-table</v-icon>
        Definitions
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          Page {{ page }} of {{ totalPages }} ({{ totalDocs }} total)
        </span>
      </v-card-title>

      <v-card-text class="pa-0">
        <div v-if="loading" class="loading-container pa-8 text-center">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading…</p>
        </div>

        <div v-else-if="listError" class="pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>Error</v-alert-title>
            {{ listError }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="rows"
          :items-per-page="limit"
          :page="page"
          density="comfortable"
          class="spec-table"
          :class="$style.dataTable"
          elevation="0"
          @update:page="handlePageChange"
        >
          <template #item.brand="{ item }">
            {{ item.brand?.name ?? '—' }}
          </template>

          <template #item.model="{ item }">
            {{ item.model?.name ?? '—' }}
          </template>

          <template #item.variants="{ item }">
            <span class="text-body-2">{{ formatVariantsCell(item) }}</span>
          </template>

          <template #item.yearRange="{ item }">
            <span class="font-weight-medium">{{ formatYearRange(item.modelYearFrom, item.modelYearTo) }}</span>
          </template>

          <template #item.name="{ item }">
            <span class="font-weight-medium">{{ item.name }}</span>
          </template>

          <template #item.value="{ item }">
            <span class="text-body-2 text-truncate d-inline-block" style="max-width: 280px" :title="item.value">
              {{ item.value }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1 justify-center">
              <v-tooltip text="Edit" location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="info"
                    v-bind="props"
                    @click="openEdit(item)"
                  >
                    <v-icon size="20">mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete" location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    v-bind="props"
                    @click="confirmDelete(item)"
                  >
                    <v-icon size="20">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-2">mdi-inbox-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis">No definitions found</p>
            </div>
          </template>
        </v-data-table>

        <div v-if="totalPages > 1" class="pagination-container pa-4">
          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="7"
            density="comfortable"
            @update:model-value="handlePageChange"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showDialog" max-width="640" scrollable persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" size="18" color="primary">mdi-clipboard-list-outline</v-icon>
          <span class="text-subtitle-1 font-weight-medium">
            {{ editingId ? 'Edit definition' : 'Create definition' }}
          </span>
          <v-spacer />
          <v-btn icon variant="text" :disabled="saving" @click="closeDialog">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-6">
          <v-alert
            v-if="dialogError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
            closable
            @click:close="dialogError = null"
          >
            {{ dialogError }}
          </v-alert>

          <v-select
            v-model="form.brand_id"
            :items="brands"
            item-title="name"
            item-value="id"
            label="Brand"
            variant="outlined"
            density="comfortable"
            :disabled="saving"
            hide-details
            class="mb-3"
          />

          <v-select
            v-model="form.model_id"
            :items="dialogModels"
            item-title="name"
            item-value="id"
            label="Model"
            variant="outlined"
            density="comfortable"
            :disabled="saving || !form.brand_id"
            :loading="loadingDialogModels"
            hide-details
            class="mb-3"
            :no-data-text="form.brand_id ? 'No models for this brand' : 'Select a brand first'"
          />

          <v-select
            v-model="form.variant_ids"
            :items="dialogVariants"
            item-title="name"
            item-value="id"
            label="Variants (optional)"
            variant="outlined"
            density="comfortable"
            multiple
            chips
            closable-chips
            clearable
            :disabled="saving || !form.model_id"
            :loading="loadingDialogVariants"
            hide-details
            class="mb-3"
            :no-data-text="form.model_id ? 'No variants for this model' : 'Select a model first'"
          />
          <p class="text-caption text-medium-emphasis mb-3">
            Leave empty for model-wide specs (all variants). Variant-specific rows appear only when the listing’s variant is one of those selected. Listings without a variant only show model-wide rows.
          </p>

          <v-select
            v-model="form.model_year_from"
            :items="yearSelectItems"
            item-title="title"
            item-value="value"
            label="Model year from"
            variant="outlined"
            density="comfortable"
            :disabled="saving"
            hide-details
            class="mb-3"
          />

          <v-select
            v-model="form.model_year_to"
            :items="yearSelectItems"
            item-title="title"
            item-value="value"
            label="Model year to"
            variant="outlined"
            density="comfortable"
            :disabled="saving"
            hide-details
            class="mb-3"
          />

          <v-text-field
            v-model="form.name"
            label="Spec name"
            variant="outlined"
            density="comfortable"
            :disabled="saving"
            hide-details
            class="mb-3"
          />

          <v-textarea
            v-model="form.value"
            label="Spec value"
            variant="outlined"
            density="comfortable"
            rows="6"
            :disabled="saving"
            hide-details
          />
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!canSubmit" @click="save">
            {{ editingId ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  createVehicleSpecDefinition,
  deleteVehicleSpecDefinition,
  getBrands,
  getVehicleModelsForListingFilters,
  getVariants,
  getVehicleSpecDefinitions,
  updateVehicleSpecDefinition,
  type VehicleSpecDefinitionModel,
  type VehicleSpecDefinitionPayload,
} from '@/api/admin.api'
import type { ConstantModel, VariantConstant, VehicleModelConstant } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const saving = ref(false)
const listError = ref<string | null>(null)
const dialogError = ref<string | null>(null)

const rows = ref<VehicleSpecDefinitionModel[]>([])
const page = ref(1)
const limit = ref(15)
const totalDocs = ref(0)
const totalPages = ref(1)
const searchInput = ref('')
const appliedSearch = ref('')

const brands = ref<ConstantModel[]>([])
/** Models for the selected brand (loaded on demand). */
const dialogModels = ref<VehicleModelConstant[]>([])
/** Variants for the selected model (loaded on demand). */
const dialogVariants = ref<VariantConstant[]>([])
const loadingDialogModels = ref(false)
const loadingDialogVariants = ref(false)
/** Skip cascading clears while hydrating the form (e.g. open edit). */
const suppressCascade = ref(false)

const showDialog = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  brand_id: undefined as number | undefined,
  model_id: undefined as number | undefined,
  variant_ids: [] as number[],
  model_year_from: undefined as number | undefined,
  model_year_to: undefined as number | undefined,
  name: '',
  value: '',
})

const pageSizeOptions = [
  { label: '15', value: 15 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const headers = [
  { title: 'Brand', key: 'brand', sortable: false },
  { title: 'Model', key: 'model', sortable: false },
  { title: 'Variants', key: 'variants', sortable: false },
  { title: 'Years', key: 'yearRange', sortable: false, width: '120px' },
  { title: 'Spec name', key: 'name', sortable: false },
  { title: 'Spec value', key: 'value', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' as const },
]

/** Model years: 1975 through current calendar year (newest first). */
const yearSelectItems = computed(() => {
  const currentYear = new Date().getFullYear()
  const items: { title: string; value: number }[] = []
  for (let y = currentYear; y >= 1975; y--) {
    items.push({ title: String(y), value: y })
  }
  return items
})

function formatYearRange(from: number, to: number): string {
  if (from === to) {
    return String(from)
  }
  return `${from}–${to}`
}

function formatVariantsCell(item: VehicleSpecDefinitionModel): string {
  const ids = item.variantIds
  if (!ids?.length) {
    return 'All variants'
  }
  const names = (item.variants ?? []).map((v) => v.name).filter(Boolean)
  if (names.length) {
    return names.join(', ')
  }
  return ids.join(', ')
}

const canSubmit = computed(() => {
  const f = form.value
  return (
    f.brand_id != null &&
    f.model_id != null &&
    f.model_year_from != null &&
    f.model_year_to != null &&
    f.model_year_from <= f.model_year_to &&
    f.name.trim() !== '' &&
    f.value.trim() !== ''
  )
})

async function loadModelsForBrand(brandId: number): Promise<void> {
  loadingDialogModels.value = true
  try {
    const acc: VehicleModelConstant[] = []
    let p = 1
    const batch = 500
    let hasMore = true
    while (hasMore) {
      const data = await getVehicleModelsForListingFilters({
        brand_id: brandId,
        limit: batch,
        page: p,
      })
      acc.push(...data.docs)
      hasMore = data.hasNextPage === true
      p += 1
      if (p > 500) break
    }
    dialogModels.value = acc.sort((a, b) => a.name.localeCompare(b.name))
  } finally {
    loadingDialogModels.value = false
  }
}

async function loadVariantsForModel(modelId: number): Promise<void> {
  loadingDialogVariants.value = true
  try {
    const acc: VariantConstant[] = []
    let p = 1
    const batch = 500
    let hasMore = true
    while (hasMore) {
      const data = await getVariants({ model_id: modelId, limit: batch, page: p })
      acc.push(...(data.docs as VariantConstant[]))
      hasMore = data.hasNextPage === true
      p += 1
      if (p > 500) break
    }
    dialogVariants.value = acc.sort((a, b) => a.name.localeCompare(b.name))
  } finally {
    loadingDialogVariants.value = false
  }
}

watch(
  () => form.value.brand_id,
  async (brandId) => {
    if (suppressCascade.value) return
    form.value.model_id = undefined
    form.value.variant_ids = []
    dialogModels.value = []
    dialogVariants.value = []
    if (brandId == null) return
    await loadModelsForBrand(brandId)
  }
)

watch(
  () => form.value.model_id,
  async (modelId) => {
    if (suppressCascade.value) return
    form.value.variant_ids = []
    dialogVariants.value = []
    if (modelId == null) return
    await loadVariantsForModel(modelId)
  }
)

async function fetchAllBrands(): Promise<void> {
  const acc: ConstantModel[] = []
  let p = 1
  const batch = 500
  let hasMore = true
  while (hasMore) {
    const data = await getBrands({ limit: batch, page: p })
    acc.push(...data.docs)
    hasMore = data.hasNextPage === true
    p += 1
    if (p > 500) break
  }
  brands.value = acc.sort((a, b) => a.name.localeCompare(b.name))
}

async function loadLookups(): Promise<void> {
  await fetchAllBrands()
}

async function loadRows(): Promise<void> {
  try {
    loading.value = true
    listError.value = null
    const data = await getVehicleSpecDefinitions({
      page: page.value,
      limit: limit.value,
      search: appliedSearch.value.trim() || undefined,
    })
    rows.value = data.docs
    totalDocs.value = data.totalDocs ?? data.total ?? data.docs.length
    totalPages.value = data.totalPages ?? Math.max(1, Math.ceil((totalDocs.value || 0) / limit.value))
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || 'Failed to load definitions'
  } finally {
    loading.value = false
  }
}

function applySearch(): void {
  appliedSearch.value = searchInput.value || ''
  page.value = 1
  loadRows()
}

function handlePageChange(next: number): void {
  page.value = next
  loadRows()
}

function handlePageSizeChange(): void {
  page.value = 1
  loadRows()
}

function resetForm(): void {
  editingId.value = null
  dialogModels.value = []
  dialogVariants.value = []
  form.value = {
    brand_id: undefined,
    model_id: undefined,
    variant_ids: [],
    model_year_from: undefined,
    model_year_to: undefined,
    name: '',
    value: '',
  }
}

function openCreate(): void {
  dialogError.value = null
  resetForm()
  showDialog.value = true
}

async function openEdit(item: VehicleSpecDefinitionModel): Promise<void> {
  dialogError.value = null
  suppressCascade.value = true
  editingId.value = item.id
  dialogModels.value = []
  dialogVariants.value = []
  try {
    await loadModelsForBrand(item.brandId)
    await loadVariantsForModel(item.modelId)
    form.value = {
      brand_id: item.brandId,
      model_id: item.modelId,
      variant_ids: [...(item.variantIds ?? [])],
      model_year_from: item.modelYearFrom,
      model_year_to: item.modelYearTo,
      name: item.name,
      value: item.value,
    }
    await nextTick()
    await nextTick()
  } finally {
    suppressCascade.value = false
  }
  showDialog.value = true
}

function closeDialog(): void {
  showDialog.value = false
  dialogError.value = null
  resetForm()
}

function buildPayload(): VehicleSpecDefinitionPayload {
  const f = form.value
  return {
    brand_id: f.brand_id!,
    model_id: f.model_id!,
    variant_ids: f.variant_ids.length > 0 ? [...f.variant_ids] : null,
    model_year_from: f.model_year_from!,
    model_year_to: f.model_year_to!,
    name: f.name.trim(),
    value: f.value.trim(),
  }
}

async function save(): Promise<void> {
  if (!canSubmit.value) return
  dialogError.value = null
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingId.value) {
      await updateVehicleSpecDefinition(editingId.value, payload)
    } else {
      await createVehicleSpecDefinition(payload)
    }
    closeDialog()
    await loadRows()
  } catch (e) {
    const err = e as ApiErrorModel
    const first = err.errors && Object.values(err.errors)[0]?.[0]
    dialogError.value = first || err.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(item: VehicleSpecDefinitionModel): Promise<void> {
  if (!confirm(`Delete spec definition “${item.name}”?`)) return
  try {
    listError.value = null
    await deleteVehicleSpecDefinition(item.id)
    await loadRows()
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || 'Failed to delete'
  }
}

onMounted(async () => {
  await loadLookups()
  await loadRows()
})
</script>

<style module>
.dataTable :global(.v-data-table__thead th) {
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px !important;
  background-color: rgba(0, 0, 0, 0.02) !important;
  color: rgba(0, 0, 0, 0.87) !important;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08) !important;
}

.dataTable :global(.v-data-table__tbody td) {
  font-size: 0.875rem !important;
  padding: 16px !important;
  height: auto !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}
</style>
