<template>
  <div class="panel-page locations-admin-container">
    <PageHeader
      :title="t('admin.views.locations.title')"
      :subtitle="t('admin.views.locations.subtitle')"
    >
      <template #actions>
        <button type="button" class="panel-btn panel-btn--primary" @click="openCreate">
          <v-icon size="16">mdi-plus</v-icon>
          {{ t('admin.views.locations.addLocation') }}
        </button>
      </template>
    </PageHeader>

    <v-row class="mb-5">
      <v-col cols="12" sm="6" md="4">
        <OverviewStatCard :label="t('admin.views.locations.statThisPage')" :value="locations.length" icon="mdi-map-marker" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <OverviewStatCard :label="t('admin.views.locations.statTotalMatching')" :value="totalDocs" icon="mdi-map-marker-multiple" color="info" value-tone="info" />
      </v-col>
    </v-row>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="search"
            :placeholder="t('admin.views.locations.searchPlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </div>
        <div class="panel-filters-grid__actions panel-filters-grid__actions--trailing">
          <button
            type="button"
            class="panel-btn panel-btn--outline"
            :disabled="loading"
            @click="loadLocations"
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
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('admin.views.locations.loadingLocations') }}</p>
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
          :items="locations"
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
          <template #item.coords="{ item }">
            <span class="text-medium-emphasis font-mono text-caption">
              {{ formatCoord(item.latitude) }}, {{ formatCoord(item.longitude) }}
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
              <v-icon size="48" color="disabled">mdi-map-marker-off</v-icon>
              <p>{{ t('admin.views.locations.noLocationsFound') }}</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <v-dialog v-model="showDialog" max-width="560" scrollable persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" size="18" color="primary">mdi-map-marker</v-icon>
          <span class="text-subtitle-1 font-weight-medium">
            {{ editingId ? t('admin.views.locations.editLocation') : t('admin.views.locations.addLocation') }}
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
                  :label="t('admin.views.locations.city')"
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
                  :label="t('admin.views.locations.postcode')"
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
                  :label="t('admin.views.locations.region')"
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
                  :label="t('admin.views.locations.countryCode')"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  maxlength="2"
                  :hint="t('admin.views.locations.countryCodeHint')"
                  persistent-hint
                  :rules="[ruleCountryCode]"
                  @update:model-value="onCountryInput"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.latitude"
                  :label="t('admin.views.locations.latitude')"
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
                  :label="t('admin.views.locations.longitude')"
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
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-content-save"
            :loading="saving"
            @click="save"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import {
  createAdminLocation,
  deleteAdminLocation,
  getAdminLocations,
  updateAdminLocation,
  type AdminLocationModel,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import OverviewStatCard from '@/components/panel/OverviewStatCard.vue'

const { t } = useI18n()

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
  return t('common.required')
}

const ruleCountryCode = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim().toUpperCase() : ''
  if (s.length !== 2 || !/^[A-Z]{2}$/.test(s)) return t('admin.views.locations.validationCountryCode')
  return true
}

const ruleLatitude = (v: unknown) => {
  const n = Number(typeof v === 'string' ? v.trim().replace(',', '.') : v)
  if (!Number.isFinite(n)) return t('admin.views.locations.validationLatitude')
  if (n < -90 || n > 90) return t('admin.views.locations.validationLatRange')
  return true
}

const ruleLongitude = (v: unknown) => {
  const n = Number(typeof v === 'string' ? v.trim().replace(',', '.') : v)
  if (!Number.isFinite(n)) return t('admin.views.locations.validationLongitude')
  if (n < -180 || n > 180) return t('admin.views.locations.validationLngRange')
  return true
}

const headers = computed(() => [
  { title: t('admin.views.locations.city'), key: 'city', sortable: false },
  { title: t('admin.views.locations.postcode'), key: 'postcode', sortable: false, width: '110px' },
  { title: t('admin.views.locations.region'), key: 'region', sortable: false },
  { title: t('admin.views.locations.country'), key: 'countryCode', sortable: false, width: '88px' },
  { title: t('admin.views.locations.coordinates'), key: 'coords', sortable: false, width: '200px' },
  { title: t('common.actions'), key: 'actions', sortable: false, width: '120px', align: 'end' as const },
])

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
    listError.value = (e as ApiErrorModel).message || t('admin.views.locations.failedLoadLocations')
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

const handleItemsPerPageChange = (next: number) => {
  limit.value = next
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
    dialogError.value = t('admin.views.locations.fixHighlightedFields')
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
    dialogError.value = (e as ApiErrorModel).message || t('common.errors.failedSaveLocation')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(row: AdminLocationModel) {
  const label = `${row.city} (${row.postcode})`
  if (!confirm(t('admin.views.locations.confirmDelete', { label }))) return
  try {
    listError.value = null
    await deleteAdminLocation(row.id)
    await loadLocations()
  } catch (e) {
    listError.value = (e as ApiErrorModel).message || t('common.errors.failedDeleteLocation')
  }
}

onMounted(() => {
  loadLocations()
})
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: 2rem;
}

.font-mono {
  font-family: ui-monospace, monospace;
}
</style>
