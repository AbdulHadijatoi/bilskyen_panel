<template>
  <div class="ownership-tax-page">
    <div class="page-header mb-4">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Ownership Tax Rules</h1>
        <p class="text-caption text-medium-emphasis mb-0">
          Define tax amounts by registration year range, km/l range, and DMR fuel type.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" size="small" @click="openCreate">
        Add Rule
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-card variant="flat" class="rules-card">
      <v-card-text class="pa-0">
        <div v-if="loading" class="pa-6 text-center">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <v-table v-else density="comfortable" class="rules-table">
          <thead>
            <tr>
              <th>Fuel type</th>
              <th>Year range</th>
              <th>Km/l range</th>
              <th class="text-right">Tax (DKK)</th>
              <th class="text-right" style="width: 140px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rules.length === 0">
              <td colspan="5" class="text-medium-emphasis text-caption pa-6 text-center">
                No rules yet.
              </td>
            </tr>
            <tr v-for="rule in rules" :key="rule.id">
              <td>
                <div class="font-weight-medium">{{ rule.driveEnergy?.name || `ID ${rule.dmrDriveEnergyId}` }}</div>
                <div class="text-caption text-medium-emphasis">DMR energy #{{ rule.dmrDriveEnergyId }}</div>
              </td>
              <td>{{ rule.registrationYearFrom }} – {{ rule.registrationYearTo }}</td>
              <td>{{ formatNumber(rule.kmPerLiterFrom) }} – {{ formatNumber(rule.kmPerLiterTo) }}</td>
              <td class="text-right">{{ formatPrice(rule.taxAmount) }}</td>
              <td class="text-right">
                <v-btn variant="text" size="small" @click="openEdit(rule)">Edit</v-btn>
                <v-btn variant="text" size="small" color="error" @click="confirmDelete(rule)">Delete</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex align-center justify-space-between pa-3">
          <div class="text-caption text-medium-emphasis">
            Page {{ page }} / {{ totalPages }} · {{ totalDocs }} total
          </div>
          <div class="d-flex gap-2">
            <v-btn
              variant="outlined"
              size="small"
              :disabled="page <= 1 || loading"
              @click="changePage(page - 1)"
            >
              Prev
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              :disabled="!hasNextPage || loading"
              @click="changePage(page + 1)"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showDialog" max-width="640">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center">
          <v-icon class="mr-2" size="18">mdi-cash-multiple</v-icon>
          {{ editingId ? 'Edit Rule' : 'Create Rule' }}
        </v-card-title>
        <v-card-text class="pa-3">
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
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="form.tax_amount"
                label="Tax amount (DKK)"
                type="number"
                min="0"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showDialog = false">Cancel</v-btn>
          <v-btn color="primary" size="small" :loading="saving" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const error = ref<string | null>(null)

const rules = ref<OwnershipTaxRuleModel[]>([])
const page = ref(1)
const limit = ref(15)
const totalDocs = ref(0)
const totalPages = ref(1)
const hasNextPage = ref(false)

const driveEnergies = ref<DmrDriveEnergyModel[]>([])
const modelYears = ref<ConstantModel[]>([])

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

const form = ref({
  dmr_drive_energy_id: undefined as number | undefined,
  registration_year_from: undefined as number | undefined,
  registration_year_to: undefined as number | undefined,
  km_per_liter_from: undefined as number | undefined,
  km_per_liter_to: undefined as number | undefined,
  tax_amount: undefined as number | undefined,
})

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
    error.value = null
    const data = await getOwnershipTaxRules({ page: page.value, limit: limit.value })
    rules.value = data.docs
    totalDocs.value = data.totalDocs ?? data.total ?? data.docs.length
    totalPages.value = data.totalPages ?? Math.max(1, Math.ceil((totalDocs.value || 0) / limit.value))
    hasNextPage.value = Boolean(data.hasNextPage)
  } catch (e) {
    error.value = (e as ApiErrorModel).message || 'Failed to load rules'
  } finally {
    loading.value = false
  }
}

const changePage = async (next: number) => {
  if (next < 1) return
  page.value = next
  await loadRules()
}

const resetForm = () => {
  editingId.value = null
  form.value = {
    dmr_drive_energy_id: undefined,
    registration_year_from: undefined,
    registration_year_to: undefined,
    km_per_liter_from: undefined,
    km_per_liter_to: undefined,
    tax_amount: undefined,
  }
}

const openCreate = () => {
  resetForm()
  showDialog.value = true
}

const openEdit = (rule: OwnershipTaxRuleModel) => {
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

const save = async () => {
  try {
    saving.value = true
    error.value = null

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
      error.value = 'Please fill all fields with valid numbers.'
      return
    }

    if (editingId.value) {
      await updateOwnershipTaxRule(editingId.value, payload)
    } else {
      await createOwnershipTaxRule(payload)
    }

    showDialog.value = false
    await loadRules()
  } catch (e) {
    error.value = (e as ApiErrorModel).message || 'Failed to save rule'
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (rule: OwnershipTaxRuleModel) => {
  if (!confirm(`Delete ownership tax rule #${rule.id}?`)) return
  try {
    error.value = null
    await deleteOwnershipTaxRule(rule.id)
    await loadRules()
  } catch (e) {
    error.value = (e as ApiErrorModel).message || 'Failed to delete rule'
  }
}

onMounted(async () => {
  await loadLookups()
  await loadRules()
})
</script>

<style scoped>
.ownership-tax-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.rules-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.rules-table th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.6);
}
</style>
