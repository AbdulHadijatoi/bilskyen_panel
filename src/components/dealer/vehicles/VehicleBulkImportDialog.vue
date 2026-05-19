<template>
  <v-dialog
    :model-value="modelValue"
    max-width="960"
    scrollable
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ t('dealer.views.vehicles.import.title') }}</span>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ t('dealer.views.vehicles.import.description') }}
        </p>

        <div class="text-subtitle-2 font-weight-medium mb-2">
          {{ t('dealer.views.vehicles.import.sampleTitle') }}
        </div>

        <v-table density="compact" class="import-sample-table mb-4">
          <thead>
            <tr>
              <th
                v-for="header in sampleHeaders"
                :key="header"
                class="text-caption"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                v-for="header in sampleHeaders"
                :key="`val-${header}`"
                class="text-caption"
              >
                {{ sampleRow[header] ?? '—' }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <p class="text-caption text-medium-emphasis mb-4">
          {{ t('dealer.views.vehicles.import.sampleHint') }}
        </p>

        <v-alert
          v-if="importError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="importError = null"
        >
          {{ importError }}
        </v-alert>

        <div class="d-flex flex-wrap gap-2 mb-4">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-download"
            :loading="downloadingTemplate"
            @click="handleDownloadTemplate"
          >
            {{ t('dealer.views.vehicles.import.downloadTemplate') }}
          </v-btn>
        </div>

        <v-file-input
          v-model="selectedFiles"
          :label="t('dealer.views.vehicles.import.fileLabel')"
          accept=".xlsx,.xls,.csv"
          prepend-icon="mdi-file-excel"
          variant="outlined"
          density="comfortable"
          show-size
          clearable
        />

        <template v-if="result">
          <v-divider class="my-4" />
          <div class="d-flex flex-wrap gap-3 mb-4">
            <v-chip color="success" variant="flat">
              {{ t('dealer.views.vehicles.import.created') }}: {{ result.summary.created }}
            </v-chip>
            <v-chip color="error" variant="flat">
              {{ t('dealer.views.vehicles.import.failed') }}: {{ result.summary.failed }}
            </v-chip>
            <v-chip color="warning" variant="flat">
              {{ t('dealer.views.vehicles.import.warnings') }}: {{ result.summary.warnings }}
            </v-chip>
          </div>

          <v-table density="compact" class="import-results-table">
            <thead>
              <tr>
                <th>{{ t('dealer.views.vehicles.import.row') }}</th>
                <th>{{ t('dealer.views.vehicles.import.registration') }}</th>
                <th>{{ t('common.status') }}</th>
                <th>{{ t('dealer.views.vehicles.import.details') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in result.rows"
                :key="row.row"
              >
                <td>{{ row.row }}</td>
                <td>{{ row.registration || '—' }}</td>
                <td>
                  <v-chip
                    size="small"
                    :color="statusColor(row.status)"
                    variant="flat"
                  >
                    {{ statusLabel(row.status) }}
                  </v-chip>
                </td>
                <td>
                  <ul
                    v-if="row.errors.length"
                    class="text-error text-caption pa-0 ma-0"
                    style="list-style: none;"
                  >
                    <li
                      v-for="(err, i) in row.errors"
                      :key="`e-${row.row}-${i}`"
                    >
                      {{ err.message }}
                    </li>
                  </ul>
                  <ul
                    v-if="row.warnings.length"
                    class="text-warning text-caption pa-0 ma-0"
                    style="list-style: none;"
                  >
                    <li
                      v-for="(warn, i) in row.warnings"
                      :key="`w-${row.row}-${i}`"
                    >
                      {{ warn.message }}
                    </li>
                  </ul>
                  <span
                    v-if="!row.errors.length && !row.warnings.length"
                    class="text-caption text-medium-emphasis"
                  >
                    —
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>

          <p
            v-if="!dryRunLast && result.summary.created > 0"
            class="text-caption text-medium-emphasis mt-4"
          >
            {{ t('dealer.views.vehicles.import.imagesNote') }}
          </p>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          {{ t('common.cancel') }}
        </v-btn>
        <v-btn
          variant="outlined"
          :loading="importing && dryRunLast"
          :disabled="!importFile || importing"
          @click="runImport(true)"
        >
          {{ t('dealer.views.vehicles.import.validateOnly') }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="importing && !dryRunLast"
          :disabled="!importFile || importing"
          @click="runImport(false)"
        >
          {{ t('dealer.views.vehicles.import.import') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">
          {{ t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  downloadVehicleImportTemplate,
  getVehicleImportSample,
  importVehicles,
  type VehicleImportResult,
} from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  imported: []
}>()

const { t } = useI18n()

const selectedFiles = ref<File[] | File | null>(null)
const downloadingTemplate = ref(false)
const importing = ref(false)
const importError = ref<string | null>(null)
const result = ref<VehicleImportResult | null>(null)
const dryRunLast = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error' | 'info' | 'warning',
})

const sampleHeaders = ref<string[]>([])
const sampleRow = ref<Record<string, string>>({})

const importFile = computed(() => {
  if (!selectedFiles.value) return null
  if (Array.isArray(selectedFiles.value)) {
    return selectedFiles.value[0] ?? null
  }
  return selectedFiles.value
})

async function loadSample() {
  try {
    const data = await getVehicleImportSample()
    sampleHeaders.value = data.headers
    sampleRow.value = data.row
  } catch {
    sampleHeaders.value = [
      'registration',
      'brand',
      'model',
      'fuel_type',
      'sales_type',
      'price',
      'km_driven',
      'gear_type',
    ]
    sampleRow.value = {
      registration: 'AB12345',
      brand: 'Volvo',
      model: 'XC60',
      fuel_type: 'Benzin',
      sales_type: 'Køb',
      price: '249900',
      km_driven: '85000',
      gear_type: 'Automatisk',
    }
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      loadSample()
      result.value = null
      importError.value = null
      selectedFiles.value = null
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function showSnackbar(
  message: string,
  color: 'success' | 'error' | 'info' | 'warning' = 'success'
) {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

function showImportCompleteSnackbar(data: VehicleImportResult, dryRun: boolean) {
  const { created, failed, total } = data.summary

  if (dryRun) {
    const valid = data.rows.filter((r) => r.status === 'validated').length
    const message =
      failed > 0
        ? t('dealer.views.vehicles.import.validateCompleteWithFailures', { valid, failed, total })
        : t('dealer.views.vehicles.import.validateComplete', { valid, total })
    showSnackbar(message, failed > 0 ? 'warning' : 'info')
    return
  }

  if (created === 0) {
    showSnackbar(
      t('dealer.views.vehicles.import.importCompleteNone', { failed, total }),
      'error'
    )
    return
  }

  const message =
    failed > 0
      ? t('dealer.views.vehicles.import.importCompleteWithFailures', { created, failed, total })
      : t('dealer.views.vehicles.import.importComplete', { created, total })
  showSnackbar(message, failed > 0 ? 'warning' : 'success')
}

async function handleDownloadTemplate() {
  try {
    downloadingTemplate.value = true
    importError.value = null
    await downloadVehicleImportTemplate()
  } catch (err) {
    importError.value = (err as ApiErrorModel).message || t('dealer.views.vehicles.import.templateFailed')
  } finally {
    downloadingTemplate.value = false
  }
}

async function runImport(dryRun: boolean) {
  const file = importFile.value
  if (!file) return

  try {
    importing.value = true
    dryRunLast.value = dryRun
    importError.value = null
    result.value = await importVehicles(file, { dryRun })
    showImportCompleteSnackbar(result.value, dryRun)
    if (!dryRun && (result.value.summary.created ?? 0) > 0) {
      emit('imported')
    }
  } catch (err) {
    importError.value = (err as ApiErrorModel).message || t('dealer.views.vehicles.import.importFailed')
  } finally {
    importing.value = false
  }
}

function statusColor(status: string) {
  if (status === 'failed') return 'error'
  if (status === 'created_with_warnings' || status === 'validated') return 'warning'
  if (status === 'created') return 'success'
  return 'grey'
}

function statusLabel(status: string) {
  const key = `dealer.views.vehicles.import.status.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}
</script>

<style scoped>
.import-sample-table,
.import-results-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.import-sample-table th,
.import-sample-table td,
.import-results-table th,
.import-results-table td {
  white-space: nowrap;
}
</style>
