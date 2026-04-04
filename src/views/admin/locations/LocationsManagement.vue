<template>
  <div class="locations-admin-container">
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Locations</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage city, postcode, region, and coordinates used in sell-your-car and vehicle forms.
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          elevation="2"
          @click="openCreate"
        >
          Add location
        </v-btn>
      </div>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-card variant="flat" class="stat-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="stat-label">This page</div>
            <div class="stat-value">{{ locations.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card variant="flat" class="stat-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="stat-label">Total matching</div>
            <div class="stat-value text-primary">{{ totalDocs }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="flat" class="filters-card mb-4" elevation="0">
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-4 flex-wrap">
          <v-text-field
            v-model="search"
            placeholder="Search city, postcode, region, country…"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="search-field flex-grow-1"
            style="max-width: 420px;"
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
            :loading="loading"
            @click="loadLocations"
          >
            Refresh
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="flat" class="table-card" elevation="0">
      <v-card-title class="card-title">
        <v-icon class="mr-2">mdi-map-marker-multiple</v-icon>
        Locations
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          Page {{ page }} of {{ totalPages }} · {{ totalDocs }} total
        </span>
      </v-card-title>

      <v-card-text class="pa-0">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading locations…</p>
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
          :items="locations"
          :items-per-page="limit"
          :page="1"
          hide-default-footer
          density="comfortable"
          class="locations-table"
          :class="$style.dataTable"
          elevation="0"
        >
          <template #item.coords="{ item }">
            <span class="text-medium-emphasis font-mono text-caption">
              {{ formatCoord(item.latitude) }}, {{ formatCoord(item.longitude) }}
            </span>
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
                    class="action-btn"
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
                    class="action-btn"
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
              <v-icon size="64" color="grey-lighten-1" class="mb-2">mdi-map-marker-off</v-icon>
              <p class="text-body-1 text-medium-emphasis">No locations found</p>
              <p class="text-caption text-medium-emphasis mt-1">
                {{ search ? 'Try a different search' : 'Add a location to get started' }}
              </p>
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

    <v-dialog v-model="showDialog" max-width="560" scrollable persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" size="18" color="primary">mdi-map-marker</v-icon>
          <span class="text-subtitle-1 font-weight-medium">
            {{ editingId ? 'Edit location' : 'Add location' }}
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

          <v-form ref="dialogFormRef">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.city"
                  label="City"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  maxlength="100"
                  :rules="[ruleRequiredString]"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.postcode"
                  label="Postcode"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  maxlength="10"
                  :rules="[ruleRequiredString]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.region"
                  label="Region"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  maxlength="100"
                  :rules="[ruleRequiredString]"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.country_code"
                  label="Country code"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  maxlength="2"
                  hint="ISO 3166-1 alpha-2 (e.g. DK)"
                  persistent-hint
                  :rules="[ruleCountryCode]"
                  @update:model-value="onCountryInput"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.latitude"
                  label="Latitude"
                  type="text"
                  inputmode="decimal"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :rules="[ruleLatitude]"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.longitude"
                  label="Longitude"
                  type="text"
                  inputmode="decimal"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :rules="[ruleLongitude]"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" size="small" :disabled="saving" @click="closeDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-content-save"
            :loading="saving"
            @click="save"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import {
  createAdminLocation,
  deleteAdminLocation,
  getAdminLocations,
  updateAdminLocation,
  type AdminLocationModel,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const saving = ref(false)
const listError = ref<string | null>(null)
const dialogError = ref<string | null>(null)

const locations = ref<AdminLocationModel[]>([])
const page = ref(1)
const limit = ref(15)
const totalDocs = ref(0)
const totalPages = ref(1)

const search = ref('')

const showDialog = ref(false)
const editingId = ref<number | null>(null)
const dialogFormRef = ref<{ validate: () => Promise<{ valid: boolean }>; resetValidation: () => void } | null>(null)

const form = ref({
  city: '',
  postcode: '',
  region: '',
  country_code: 'DK',
  latitude: '',
  longitude: '',
})

const ruleRequiredString = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (s.length > 0) return true
  return 'Required'
}

const ruleCountryCode = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim().toUpperCase() : ''
  if (s.length !== 2 || !/^[A-Z]{2}$/.test(s)) return 'Use a 2-letter country code'
  return true
}

const ruleLatitude = (v: unknown) => {
  const n = Number(typeof v === 'string' ? v.trim().replace(',', '.') : v)
  if (!Number.isFinite(n)) return 'Enter a valid latitude'
  if (n < -90 || n > 90) return 'Latitude must be between -90 and 90'
  return true
}

const ruleLongitude = (v: unknown) => {
  const n = Number(typeof v === 'string' ? v.trim().replace(',', '.') : v)
  if (!Number.isFinite(n)) return 'Enter a valid longitude'
  if (n < -180 || n > 180) return 'Longitude must be between -180 and 180'
  return true
}

const headers = [
  { title: 'City', key: 'city', sortable: false },
  { title: 'Postcode', key: 'postcode', sortable: false, width: '110px' },
  { title: 'Region', key: 'region', sortable: false },
  { title: 'Country', key: 'countryCode', sortable: false, width: '88px' },
  { title: 'Coordinates', key: 'coords', sortable: false, width: '200px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' as const },
]

const pageSizeOptions = [
  { label: '15', value: 15 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

function formatCoord(n: number) {
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(n)
}

function onCountryInput(v: string | null) {
  if (v == null) {
    form.value.country_code = ''
    return
  }
  form.value.country_code = v.toUpperCase().slice(0, 2)
}

const loadLocations = async () => {
  try {
    loading.value = true
    listError.value = null
    const q = search.value.trim()
    const data = await getAdminLocations({
      page: page.value,
      limit: limit.value,
      q: q || undefined,
    })
    locations.value = data.docs
    totalDocs.value = data.totalDocs ?? data.total ?? data.docs.length
    totalPages.value = data.totalPages ?? Math.max(1, Math.ceil((totalDocs.value || 0) / limit.value))
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || 'Failed to load locations'
  } finally {
    loading.value = false
  }
}

const debouncedSearchReload = useDebounceFn(() => {
  page.value = 1
  loadLocations()
}, 350)

watch(search, () => {
  debouncedSearchReload()
})

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  loadLocations()
}

const handlePageSizeChange = () => {
  page.value = 1
  loadLocations()
}

function resetForm() {
  editingId.value = null
  form.value = {
    city: '',
    postcode: '',
    region: '',
    country_code: 'DK',
    latitude: '',
    longitude: '',
  }
}

function openCreate() {
  dialogError.value = null
  resetForm()
  showDialog.value = true
}

function openEdit(row: AdminLocationModel) {
  dialogError.value = null
  editingId.value = row.id
  form.value = {
    city: row.city,
    postcode: row.postcode,
    region: row.region,
    country_code: row.countryCode,
    latitude: String(row.latitude),
    longitude: String(row.longitude),
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  dialogError.value = null
  resetForm()
}

function parseNumField(raw: string): number {
  return Number(String(raw).trim().replace(',', '.'))
}

async function save() {
  dialogError.value = null
  const validation = await dialogFormRef.value?.validate()
  if (validation && !validation.valid) {
    dialogError.value = 'Please fix the highlighted fields.'
    return
  }

  const lat = parseNumField(form.value.latitude)
  const lng = parseNumField(form.value.longitude)
  const payload = {
    city: form.value.city.trim(),
    postcode: form.value.postcode.trim(),
    region: form.value.region.trim(),
    country_code: form.value.country_code.trim().toUpperCase(),
    latitude: lat,
    longitude: lng,
  }

  try {
    saving.value = true
    if (editingId.value !== null) {
      await updateAdminLocation(editingId.value, payload)
    } else {
      await createAdminLocation(payload)
    }
    await loadLocations()
    closeDialog()
  } catch (e) {
    dialogError.value = (e as ApiErrorModel).message || 'Failed to save location'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(row: AdminLocationModel) {
  const label = `${row.city} (${row.postcode})`
  if (!confirm(`Delete location “${label}”?`)) return
  try {
    listError.value = null
    await deleteAdminLocation(row.id)
    await loadLocations()
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || 'Failed to delete location'
  }
}

onMounted(() => {
  loadLocations()
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
.locations-admin-container {
  max-width: 1400px;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
}

.filters-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
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
  min-height: 280px;
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

.pagination-container {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 0, 0, 0.01);
}

.gap-4 {
  gap: 16px;
}

.font-mono {
  font-family: ui-monospace, monospace;
}

@media (max-width: 960px) {
  .locations-admin-container {
    padding: 16px;
  }
}
</style>
