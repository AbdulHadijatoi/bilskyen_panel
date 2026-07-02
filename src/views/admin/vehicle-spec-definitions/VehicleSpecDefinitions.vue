<template>
  <div class="panel-page vehicle-spec-definitions">
    <PageHeader
      :title="t('admin.nav.vehicleSpecDefinitions')"
      subtitle="Catalog spec name and value by brand, model, optional variants (multi-select), and inclusive model year range."
    >
      <template #actions>
        <button type="button" class="panel-btn panel-btn--primary" @click="openCreate">
          <v-icon size="16">mdi-plus</v-icon>
          Create
        </button>
      </template>
    </PageHeader>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="search"
            placeholder="Search spec name or value..."
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            @update:model-value="handleSearch"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__actions panel-filters-grid__actions--trailing">
          <button
            type="button"
            class="panel-btn panel-btn--outline"
            :disabled="loading"
            @click="loadRows"
          >
            <v-icon size="16">mdi-refresh</v-icon>
            {{ t('common.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <div class="panel-table-card">
      <div class="panel-table-card__body">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('common.loading') }}</p>
        </div>

        <div v-else-if="listError" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>{{ t('common.error') }}</v-alert-title>
            {{ listError }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="rows"
          :items-per-page="limit"
          :items-per-page-options="pageSizeOptions"
          :items-length="totalDocs"
          :page="page"
          density="comfortable"
          class="panel-data-table"
          elevation="0"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #item.brand="{ item }">
            <span class="panel-vehicle-cell__title">{{ item.brand?.name ?? '—' }}</span>
          </template>

          <template #item.model="{ item }">
            <span class="panel-vehicle-cell__title">{{ item.model?.name ?? '—' }}</span>
          </template>

          <template #item.variants="{ item }">
            <span class="panel-vehicle-cell__subtitle">{{ formatVariantsCell(item) }}</span>
          </template>

          <template #item.yearRange="{ item }">
            <span class="panel-id-cell">{{ formatYearRange(item.modelYearFrom, item.modelYearTo) }}</span>
          </template>

          <template #item.name="{ item }">
            <span class="panel-vehicle-cell__title">{{ item.name }}</span>
          </template>

          <template #item.value="{ item }">
            <span
              class="panel-vehicle-cell__subtitle text-truncate d-inline-block"
              style="max-width: 280px"
              :title="item.value"
            >
              {{ item.value }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="panel-row-actions">
              <button
                type="button"
                class="panel-icon-btn panel-icon-btn--primary"
                :title="t('common.edit')"
                @click="openEdit(item)"
              >
                <v-icon size="16">mdi-pencil-outline</v-icon>
              </button>
              <button
                type="button"
                class="panel-icon-btn panel-icon-btn--danger"
                :title="t('common.delete')"
                @click="confirmDelete(item)"
              >
                <v-icon size="16">mdi-trash-can-outline</v-icon>
              </button>
            </div>
          </template>

          <template #no-data>
            <div class="panel-table-empty">
              <v-icon size="48" color="disabled">mdi-inbox-outline</v-icon>
              <p>No definitions found</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

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
import { useI18n } from 'vue-i18n'
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
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()

const loading = ref(false)
const saving = ref(false)
const listError = ref<string | null>(null)
const dialogError = ref<string | null>(null)

const rows = ref<VehicleSpecDefinitionModel[]>([])
const page = ref(1)
const limit = ref(15)
const totalDocs = ref(0)
const totalPages = ref(1)
const search = ref('')

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

const pageSizeOptions = [15, 50, 100]

const headers = [
  { title: 'Brand', key: 'brand', sortable: false },
  { title: 'Model', key: 'model', sortable: false },
  { title: 'Variants', key: 'variants', sortable: false },
  { title: 'Years', key: 'yearRange', sortable: false, width: '120px' },
  { title: 'Spec name', key: 'name', sortable: false },
  { title: 'Spec value', key: 'value', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'end' as const },
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
      search: search.value.trim() || undefined,
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

function handleSearch(): void {
  page.value = 1
  loadRows()
}

function handlePageChange(next: number): void {
  page.value = next
  loadRows()
}

function handleItemsPerPageChange(next: number): void {
  limit.value = next
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

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
}
</style>
