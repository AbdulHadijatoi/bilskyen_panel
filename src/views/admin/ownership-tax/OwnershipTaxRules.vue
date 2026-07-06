<template>
  <div class="panel-page ownership-tax-overview-container">
    <PageHeader
      :title="t('admin.views.ownershipTax.title')"
      :subtitle="t('admin.views.ownershipTax.subtitle')"
    >
      <template #actions>
        <button type="button" class="panel-btn panel-btn--primary" @click="openCreate">
          <v-icon size="16">mdi-plus</v-icon>
          {{ t('admin.views.ownershipTax.addRule') }}
        </button>
      </template>
    </PageHeader>

    <v-row class="mb-5">
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.ownershipTax.statsRulesThisPage')" :value="rules.length" icon="mdi-cash-multiple" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.ownershipTax.statsFuelTypesThisPage')" :value="uniqueFuelTypesCount" icon="mdi-fuel" color="success" value-tone="success" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.ownershipTax.statsFiltered')" :value="filteredRules.length" icon="mdi-filter" color="info" value-tone="info" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.ownershipTax.statsTotalRules')" :value="totalDocs" icon="mdi-database" color="warning" value-tone="warning" />
      </v-col>
    </v-row>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="search"
            :placeholder="t('admin.views.ownershipTax.searchPlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.ownershipTax.fuelType') }}</span>
          <v-select
            v-model="fuelFilter"
            :items="fuelFilterOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-fuel"
            hide-details
            clearable
          />
        </div>
        <div class="panel-filters-grid__actions panel-filters-grid__actions--trailing">
          <button
            type="button"
            class="panel-btn panel-btn--outline"
            :disabled="loading"
            @click="loadRules"
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
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('admin.views.ownershipTax.loadingRules') }}</p>
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
          :items="filteredRules"
          :items-per-page="limit"
          :items-per-page-options="[15, 50, 100]"
          :items-length="totalDocs"
          :page="page"
          density="comfortable"
          class="panel-data-table"
          elevation="0"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #item.fuelType="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.driveEnergy?.name || `ID ${item.dmrDriveEnergyId}` }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ t('admin.views.ownershipTax.dmrEnergy', { id: item.dmrDriveEnergyId }) }}
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
              <p>{{ t('admin.views.ownershipTax.noRulesFound') }}</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <v-dialog v-model="showDialog" max-width="720" scrollable persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" size="18" color="primary">mdi-cash-multiple</v-icon>
          <span class="text-subtitle-1 font-weight-medium">
            {{ editingId ? t('admin.views.ownershipTax.editRule') : t('admin.views.ownershipTax.createRule') }}
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
                :label="t('admin.views.ownershipTax.fuelTypeDmr')"
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
                :label="t('admin.views.ownershipTax.registrationYearFrom')"
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
                :label="t('admin.views.ownershipTax.registrationYearTo')"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[ruleRequiredYearTo, ruleYearRange]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.km_per_liter_from"
                :label="t('admin.views.ownershipTax.kmPerLiterFrom')"
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
                :label="t('admin.views.ownershipTax.kmPerLiterTo')"
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
                :label="t('admin.views.ownershipTax.taxAmountDkk')"
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

          <v-checkbox
            v-model="keepFuelAndYears"
            :label="t('admin.views.ownershipTax.keepFuelAndYears')"
            density="compact"
            hide-details
            class="mt-2"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" size="small" @click="closeDialog" :disabled="saving">
            {{ t('common.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-content-save"
            :loading="saving"
            @click="save(false)"
          >
            {{ t('common.save') }}
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
            {{ t('admin.views.ownershipTax.saveAndAddAnother') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createOwnershipTaxRule,
  deleteOwnershipTaxRule,
  getDmrDriveEnergies,
  getOwnershipTaxRules,
  updateOwnershipTaxRule,
  type DmrDriveEnergyModel,
  type OwnershipTaxRuleModel,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import OverviewStatCard from '@/components/panel/OverviewStatCard.vue'

const { t } = useI18n()

const loading = ref(false)
const saving = ref(false)
const listError = ref<string | null>(null)
const dialogError = ref<string | null>(null)

const rules = ref<OwnershipTaxRuleModel[]>([])
const page = ref(1)
const limit = ref(15)
const totalDocs = ref(0)
const totalPages = ref(1)

const driveEnergies = ref<DmrDriveEnergyModel[]>([])

const REGISTRATION_YEAR_MIN = 1900
const REGISTRATION_YEAR_MAX = 2100

const search = ref('')
const fuelFilter = ref<number | null>(null)

const yearOptions = computed(() => {
  const opts: { label: string; value: number }[] = []
  for (let y = REGISTRATION_YEAR_MIN; y <= REGISTRATION_YEAR_MAX; y++) {
    opts.push({ label: String(y), value: y })
  }
  return opts
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
  return t('admin.views.ownershipTax.validationSelectFuel')
}

const ruleRequiredYearFrom = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '') return true
  return t('admin.views.ownershipTax.validationSelectYearFrom')
}

const ruleRequiredYearTo = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '') return true
  return t('admin.views.ownershipTax.validationSelectYearTo')
}

const ruleYearRange = (v: unknown) => {
  const from = form.value.registration_year_from
  const to = typeof v === 'number' ? v : Number(v)
  if (from == null || !Number.isFinite(from) || !Number.isFinite(to)) return true
  if (to < from) return t('admin.views.ownershipTax.validationYearRange')
  return true
}

const ruleRequiredKmFrom = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v))) return true
  return t('admin.views.ownershipTax.validationKmFrom')
}

const ruleRequiredKmTo = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v))) return true
  return t('admin.views.ownershipTax.validationKmTo')
}

const ruleKmRange = (v: unknown) => {
  const from = form.value.km_per_liter_from
  const to = Number(v)
  if (from == null || !Number.isFinite(from) || !Number.isFinite(to)) return true
  if (to < from) return t('admin.views.ownershipTax.validationKmRange')
  return true
}

const ruleRequiredTax = (v: unknown) => {
  if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) return true
  return t('admin.views.ownershipTax.validationTax')
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

const headers = computed(() => [
  { title: t('admin.views.ownershipTax.fuelType'), key: 'fuelType', sortable: false },
  { title: t('admin.views.ownershipTax.colYearRange'), key: 'yearRange', sortable: false, width: '160px' },
  { title: t('admin.views.ownershipTax.colKmRange'), key: 'kmRange', sortable: false, width: '180px' },
  { title: t('admin.views.ownershipTax.colTaxAmount'), key: 'taxAmount', sortable: false, width: '140px', align: 'end' as const },
  { title: t('common.actions'), key: 'actions', sortable: false, width: '120px', align: 'center' as const },
])

const uniqueFuelTypesCount = computed(() => {
  const ids = new Set<number>()
  rules.value.forEach(r => ids.add(r.dmrDriveEnergyId))
  return ids.size
})

const fuelFilterOptions = computed(() => {
  return driveEnergies.value.map(e => ({ label: e.name, value: e.id }))
})

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
  driveEnergies.value = await getDmrDriveEnergies()
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
    listError.value = (e as ApiErrorModel).message || t('admin.views.ownershipTax.failedLoadRules')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  loadRules()
}

const handleItemsPerPageChange = (next: number) => {
  limit.value = next
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
    dialogError.value = t('admin.views.ownershipTax.fixHighlightedFields')
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
      dialogError.value = t('admin.views.ownershipTax.fillAllFieldsValidNumbers')
      return
    }

    if (payload.registration_year_from > payload.registration_year_to) {
      dialogError.value = t('admin.views.ownershipTax.yearFromGreaterThanTo')
      return
    }

    if (payload.km_per_liter_from > payload.km_per_liter_to) {
      dialogError.value = t('admin.views.ownershipTax.kmFromGreaterThanTo')
      return
    }

    if (isEditing) {
      await updateOwnershipTaxRule(editingId.value!, payload)
      await loadRules()
      closeDialog()
      return
    }

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
    dialogError.value = (e as ApiErrorModel).message || t('admin.views.ownershipTax.failedSaveRule')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (rule: OwnershipTaxRuleModel) => {
  if (!confirm(t('admin.views.ownershipTax.confirmDelete', { id: rule.id }))) return
  try {
    listError.value = null
    await deleteOwnershipTaxRule(rule.id)
    await loadRules()
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || t('admin.views.ownershipTax.failedDeleteRule')
  }
}

onMounted(async () => {
  await loadLookups()
  await loadRules()
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
