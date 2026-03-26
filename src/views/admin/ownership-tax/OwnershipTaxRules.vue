<template>
  <div class="ownership-tax-overview-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Ownership Tax Rules</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Define tax amounts by registration year range, km/l range, and DMR fuel type.
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="default"
          @click="openCreate"
          elevation="2"
        >
          Add Rule
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="stat-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Rules (this page)</div>
                <div class="stat-value">{{ rules.length }}</div>
              </div>
              <v-icon size="40" color="primary" class="stat-icon">mdi-cash-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="stat-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Fuel types (this page)</div>
                <div class="stat-value text-success">{{ uniqueFuelTypesCount }}</div>
              </div>
              <v-icon size="40" color="success" class="stat-icon">mdi-fuel</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="stat-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Filtered</div>
                <div class="stat-value text-info">{{ filteredRules.length }}</div>
              </div>
              <v-icon size="40" color="info" class="stat-icon">mdi-filter</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="stat-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Total rules</div>
                <div class="stat-value text-warning">{{ totalDocs }}</div>
              </div>
              <v-icon size="40" color="warning" class="stat-icon">mdi-database</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search Card -->
    <v-card variant="flat" class="filters-card mb-4" elevation="0">
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-4 flex-wrap">
          <v-text-field
            v-model="search"
            placeholder="Search fuel type / ranges / amount..."
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="search-field flex-grow-1"
            style="max-width: 400px;"
            hide-details
            clearable
          />

          <v-select
            v-model="fuelFilter"
            :items="fuelFilterOptions"
            item-title="label"
            item-value="value"
            label="Fuel type"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-fuel"
            style="max-width: 260px;"
            hide-details
            clearable
          />

          <v-select
            v-model="limit"
            :items="pageSizeOptions"
            item-title="label"
            item-value="value"
            label="Rows"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-format-list-numbered"
            style="max-width: 160px;"
            hide-details
            @update:model-value="handlePageSizeChange"
          />

          <v-spacer />

          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="loadRules"
            :loading="loading"
            size="default"
          >
            Refresh
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Table Card -->
    <v-card variant="flat" class="table-card" elevation="0">
      <v-card-title class="card-title">
        <v-icon class="mr-2">mdi-table</v-icon>
        Rules List
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          Showing {{ filteredRules.length }} of {{ totalDocs }}
        </span>
      </v-card-title>

      <v-card-text class="pa-0">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading rules...</p>
        </div>

        <div v-else-if="listError" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>Error</v-alert-title>
            {{ listError }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="filteredRules"
          :items-per-page="limit"
          :page="page"
          density="comfortable"
          class="rules-table"
          :class="$style.dataTable"
          elevation="0"
          @update:page="handlePageChange"
        >
          <template #item.fuelType="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.driveEnergy?.name || `ID ${item.dmrDriveEnergyId}` }}
              </div>
              <div class="text-caption text-medium-emphasis">
                DMR energy #{{ item.dmrDriveEnergyId }}
              </div>
            </div>
          </template>

          <template #item.yearRange="{ item }">
            <span class="text-medium-emphasis font-weight-medium">
              {{ item.registrationYearFrom }} – {{ item.registrationYearTo }}
            </span>
          </template>

          <template #item.kmRange="{ item }">
            <span class="text-medium-emphasis font-weight-medium">
              {{ formatNumber(item.kmPerLiterFrom) }} – {{ formatNumber(item.kmPerLiterTo) }}
            </span>
          </template>

          <template #item.taxAmount="{ item }">
            <span class="font-weight-bold">{{ formatPrice(item.taxAmount) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1 align-center justify-center">
              <v-tooltip text="Edit" location="top">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="info"
                    v-bind="props"
                    @click="openEdit(item)"
                    class="action-btn"
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
                    class="action-btn"
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
              <p class="text-body-1 text-medium-emphasis">No rules found</p>
              <p class="text-caption text-medium-emphasis mt-1">
                {{ search || fuelFilter ? 'Try adjusting your filters' : 'Click “Add Rule” to create your first rule' }}
              </p>
            </div>
          </template>
        </v-data-table>

        <!-- Pagination -->
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

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="720" scrollable persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" size="18" color="primary">mdi-cash-multiple</v-icon>
          <span class="text-subtitle-1 font-weight-medium">
            {{ editingId ? 'Edit Rule' : 'Create Rule' }}
          </span>
          <v-spacer />
          <v-btn icon variant="text" @click="closeDialog" :disabled="saving">
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

          <v-form ref="dialogFormRef">
            <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="form.dmr_drive_energy_id"
                :items="driveEnergies"
                item-title="name"
                item-value="id"
                label="Fuel type (DMR)"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredFuel]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.registration_year_from"
                :items="yearOptions"
                item-title="label"
                item-value="value"
                label="Registration year from"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredYearFrom]"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.registration_year_to"
                :items="yearOptions"
                item-title="label"
                item-value="value"
                label="Registration year to"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredYearTo, ruleYearRange]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.km_per_liter_from"
                label="Km/l from"
                type="number"
                step="0.001"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredKmFrom]"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.km_per_liter_to"
                label="Km/l to"
                type="number"
                step="0.001"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredKmTo, ruleKmRange]"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="form.tax_amount"
                label="Tax amount (DKK)"
                type="number"
                min="0"
                step="1"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredTax]"
              />
            </v-col>
            </v-row>
          </v-form>

          <!-- Bulk entry helper -->
          <v-checkbox
            v-model="keepFuelAndYears"
            label="Keep Fuel type + Year ranges when using Save & Add Another"
            density="compact"
            hide-details
            class="mt-2"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" size="small" @click="closeDialog" :disabled="saving">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-content-save"
            :loading="saving"
            @click="save(false)"
          >
            Save
          </v-btn>

          <v-btn
            v-if="!editingId"
            color="secondary"
            variant="flat"
            size="small"
            prepend-icon="mdi-plus"
            :loading="saving"
            @click="save(true)"
          >
            Save & Add Another
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  createOwnershipTaxRule,
  deleteOwnershipTaxRule,
  getDmrDriveEnergies,
  getModelYears,
  getOwnershipTaxRules,
  updateOwnershipTaxRule,
  type DmrDriveEnergyModel,
  type OwnershipTaxRuleModel,
} from '@/api/admin.api'
import type { ConstantModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const saving = ref(false)
/** Errors for list load / delete only — never used for dialog validation (avoids hiding the table). */
const listError = ref<string | null>(null)
/** Errors for create/edit dialog (validation + API). */
const dialogError = ref<string | null>(null)

const rules = ref<OwnershipTaxRuleModel[]>([])
const page = ref(1)
const limit = ref(15)
const totalDocs = ref(0)
const totalPages = ref(1)

const driveEnergies = ref<DmrDriveEnergyModel[]>([])
const modelYears = ref<ConstantModel[]>([])

const search = ref('')
const fuelFilter = ref<number | null>(null)

const yearOptions = computed(() => {
  return modelYears.value
    .map((y) => {
      const n = Number.parseInt(String(y.name), 10)
      if (!Number.isFinite(n)) return null
      return { label: String(y.name), value: n }
    })
    .filter((x): x is { label: string; value: number } => x !== null)
    .sort((a, b) => a.value - b.value)
})

const showDialog = ref(false)
const editingId = ref<number | null>(null)
const keepFuelAndYears = ref(true)
const dialogFormRef = ref<{ validate: () => Promise<{ valid: boolean }>; resetValidation: () => void } | null>(null)

const form = ref({
  dmr_drive_energy_id: undefined as number | undefined,
  registration_year_from: undefined as number | undefined,
  registration_year_to: undefined as number | undefined,
  km_per_liter_from: undefined as number | undefined,
  km_per_liter_to: undefined as number | undefined,
  tax_amount: undefined as number | undefined,
})

const ruleRequiredFuel = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '') return true
  return 'Select a fuel type'
}

const ruleRequiredYearFrom = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '') return true
  return 'Select year from'
}

const ruleRequiredYearTo = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '') return true
  return 'Select year to'
}

const ruleYearRange = (v: unknown) => {
  const from = form.value.registration_year_from
  const to = typeof v === 'number' ? v : Number(v)
  if (from == null || !Number.isFinite(from) || !Number.isFinite(to)) return true
  if (to < from) return 'Year to must be greater than or equal to year from'
  return true
}

const ruleRequiredKmFrom = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v))) return true
  return 'Enter km/l from'
}

const ruleRequiredKmTo = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v))) return true
  return 'Enter km/l to'
}

const ruleKmRange = (v: unknown) => {
  const from = form.value.km_per_liter_from
  const to = Number(v)
  if (from == null || !Number.isFinite(from) || !Number.isFinite(to)) return true
  if (to < from) return 'Km/l to must be greater than or equal to km/l from'
  return true
}

const ruleRequiredTax = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) return true
  return 'Enter a valid tax amount'
}

const formatPrice = (amount?: number) => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (n: number) => new Intl.NumberFormat('da-DK', { maximumFractionDigits: 3 }).format(n)

const headers = [
  { title: 'Fuel type', key: 'fuelType', sortable: false },
  { title: 'Year range', key: 'yearRange', sortable: false, width: '160px' },
  { title: 'Km/l range', key: 'kmRange', sortable: false, width: '180px' },
  { title: 'Tax (DKK)', key: 'taxAmount', sortable: false, width: '140px', align: 'end' as const },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' as const },
]

const uniqueFuelTypesCount = computed(() => {
  const ids = new Set<number>()
  rules.value.forEach(r => ids.add(r.dmrDriveEnergyId))
  return ids.size
})

const fuelFilterOptions = computed(() => {
  const opts = driveEnergies.value.map(e => ({ label: e.name, value: e.id }))
  return opts
})

const pageSizeOptions = [
  { label: '15', value: 15 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const filteredRules = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return rules.value.filter((r) => {
    if (fuelFilter.value && r.dmrDriveEnergyId !== fuelFilter.value) return false

    if (!q) return true

    const fuelName = (r.driveEnergy?.name || '').toLowerCase()
    const yearText = `${r.registrationYearFrom}-${r.registrationYearTo}`
    const kmText = `${r.kmPerLiterFrom}-${r.kmPerLiterTo}`
    const taxText = String(r.taxAmount)
    return (
      fuelName.includes(q) ||
      yearText.includes(q) ||
      kmText.includes(q) ||
      taxText.includes(q)
    )
  })
})

const loadLookups = async () => {
  const [energies, yearsPage] = await Promise.all([
    getDmrDriveEnergies(1000),
    getModelYears({ limit: 500, page: 1 }),
  ])
  driveEnergies.value = energies
  modelYears.value = yearsPage.docs
}

const loadRules = async () => {
  try {
    loading.value = true
    listError.value = null
    const data = await getOwnershipTaxRules({ page: page.value, limit: limit.value })
    rules.value = data.docs
    totalDocs.value = data.totalDocs ?? data.total ?? data.docs.length
    totalPages.value = data.totalPages ?? Math.max(1, Math.ceil((totalDocs.value || 0) / limit.value))
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || 'Failed to load rules'
  } finally {
    loading.value = false
  }
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  loadRules()
}

const handlePageSizeChange = () => {
  page.value = 1
  loadRules()
}

const resetForm = (core?: Partial<typeof form.value>) => {
  editingId.value = null
  form.value = {
    dmr_drive_energy_id: undefined,
    registration_year_from: undefined,
    registration_year_to: undefined,
    km_per_liter_from: undefined,
    km_per_liter_to: undefined,
    tax_amount: undefined,
  }

  if (core) {
    form.value = { ...form.value, ...core }
  }
}

const openCreate = () => {
  dialogError.value = null
  resetForm()
  showDialog.value = true
}

const openEdit = (rule: OwnershipTaxRuleModel) => {
  dialogError.value = null
  editingId.value = rule.id
  form.value = {
    dmr_drive_energy_id: rule.dmrDriveEnergyId,
    registration_year_from: rule.registrationYearFrom,
    registration_year_to: rule.registrationYearTo,
    km_per_liter_from: rule.kmPerLiterFrom,
    km_per_liter_to: rule.kmPerLiterTo,
    tax_amount: rule.taxAmount,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogError.value = null
  resetForm()
}

const save = async (continueAdding: boolean) => {
  dialogError.value = null

  const validation = await dialogFormRef.value?.validate()
  if (validation && !validation.valid) {
    dialogError.value = 'Please fix the highlighted fields.'
    return
  }

  try {
    saving.value = true

    const isEditing = editingId.value !== null

    const payload = {
      registration_year_from: Number(form.value.registration_year_from),
      registration_year_to: Number(form.value.registration_year_to),
      km_per_liter_from: Number(form.value.km_per_liter_from),
      km_per_liter_to: Number(form.value.km_per_liter_to),
      dmr_drive_energy_id: Number(form.value.dmr_drive_energy_id),
      tax_amount: Number(form.value.tax_amount),
    }

    if (
      !Number.isFinite(payload.registration_year_from) ||
      !Number.isFinite(payload.registration_year_to) ||
      !Number.isFinite(payload.km_per_liter_from) ||
      !Number.isFinite(payload.km_per_liter_to) ||
      !Number.isFinite(payload.dmr_drive_energy_id) ||
      !Number.isFinite(payload.tax_amount)
    ) {
      dialogError.value = 'Please fill all fields with valid numbers.'
      return
    }

    if (payload.registration_year_from > payload.registration_year_to) {
      dialogError.value = 'Registration year from cannot be greater than year to.'
      return
    }

    if (payload.km_per_liter_from > payload.km_per_liter_to) {
      dialogError.value = 'Km/l from cannot be greater than km/l to.'
      return
    }

    if (isEditing) {
      await updateOwnershipTaxRule(editingId.value!, payload)
      await loadRules()
      closeDialog()
      return
    }

    // Create mode
    const core = keepFuelAndYears.value
      ? {
        dmr_drive_energy_id: form.value.dmr_drive_energy_id,
        registration_year_from: form.value.registration_year_from,
        registration_year_to: form.value.registration_year_to,
      }
      : undefined

    await createOwnershipTaxRule(payload)
    await loadRules()

    if (continueAdding) {
      dialogError.value = null
      resetForm(core)
      showDialog.value = true
      await nextTick()
      dialogFormRef.value?.resetValidation()
    } else {
      closeDialog()
    }
  } catch (e) {
    dialogError.value = (e as ApiErrorModel).message || 'Failed to save rule'
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (rule: OwnershipTaxRuleModel) => {
  if (!confirm(`Delete ownership tax rule #${rule.id}?`)) return
  try {
    listError.value = null
    await deleteOwnershipTaxRule(rule.id)
    await loadRules()
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || 'Failed to delete rule'
  }
}

onMounted(async () => {
  await loadLookups()
  await loadRules()
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

.dataTable :global(.v-data-table__tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.dataTable :global(.v-data-table) {
  background-color: transparent !important;
}
</style>

<style scoped>
.ownership-tax-overview-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 24px;
}

.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
}

.stat-icon {
  opacity: 0.8;
}

.filters-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

.table-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.error-container {
  min-height: 200px;
}

.action-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.pagination-container {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 0, 0, 0.01);
}

.gap-4 {
  gap: 16px;
}

.rules-table {
  background-color: transparent;
}

@media (max-width: 960px) {
  .ownership-tax-overview-container {
    padding: 16px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 32px !important;
  }
}
</style>
