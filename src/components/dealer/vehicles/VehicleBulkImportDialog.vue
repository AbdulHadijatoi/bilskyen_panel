<template>
  <v-dialog
    :model-value="modelValue"
    max-width="960"
    scrollable
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="panel-detail-dialog import-dialog" variant="flat">
      <div class="panel-detail-dialog__header">
        <h2 class="panel-detail-dialog__title">
          <v-icon size="20">mdi-upload-multiple</v-icon>
          {{ t('dealer.views.vehicles.import.title') }}
        </h2>
        <button
          type="button"
          class="panel-icon-btn"
          :aria-label="t('common.close')"
          :disabled="importing"
          @click="close"
        >
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <div class="panel-detail-dialog__body import-dialog__body">
        <ol class="import-dialog__steps" aria-label="Import steps">
          <li
            class="import-dialog__step"
            :class="{ 'import-dialog__step--active': currentStep >= 1, 'import-dialog__step--done': currentStep > 1 }"
          >
            <span class="import-dialog__step-marker">1</span>
            <span class="import-dialog__step-label">{{ t('dealer.views.vehicles.import.stepPrepare') }}</span>
          </li>
          <li
            class="import-dialog__step"
            :class="{ 'import-dialog__step--active': currentStep >= 2, 'import-dialog__step--done': currentStep > 2 }"
          >
            <span class="import-dialog__step-marker">2</span>
            <span class="import-dialog__step-label">{{ t('dealer.views.vehicles.import.stepUpload') }}</span>
          </li>
          <li
            class="import-dialog__step"
            :class="{ 'import-dialog__step--active': currentStep >= 3 }"
          >
            <span class="import-dialog__step-marker">3</span>
            <span class="import-dialog__step-label">{{ t('dealer.views.vehicles.import.stepReview') }}</span>
          </li>
        </ol>

        <div class="panel-detail-dialog__desc import-dialog__intro">
          <p class="panel-detail-dialog__desc-text mb-0">
            {{ t('dealer.views.vehicles.import.description') }}
          </p>
        </div>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-progress-clock"
          class="import-dialog__alert"
        >
          {{ t('dealer.views.vehicles.import.syncProcessingNote') }}
        </v-alert>

        <v-alert
          v-if="importing"
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-progress-clock"
          class="import-dialog__alert"
        >
          <v-progress-linear indeterminate color="primary" class="mb-2" rounded />
          {{ importingDryRun ? t('dealer.views.vehicles.import.validating') : t('dealer.views.vehicles.import.processing') }}
        </v-alert>

        <v-alert
          v-if="usageNotice"
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-information-outline"
          class="import-dialog__alert"
        >
          {{ usageNotice.message }}
        </v-alert>

        <v-alert
          v-if="importError"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="import-dialog__alert"
          @click:close="importError = null"
        >
          {{ importError }}
        </v-alert>

        <section class="import-dialog__section" aria-labelledby="import-prepare-heading">
          <h3 id="import-prepare-heading" class="panel-detail-dialog__section-title">
            {{ t('dealer.views.vehicles.import.stepPrepare') }}
          </h3>

          <div class="import-dialog__prepare-card">
            <div class="import-dialog__prepare-actions">
              <button
                type="button"
                class="panel-btn panel-btn--outline"
                :disabled="downloadingTemplate || importing"
                @click="handleDownloadTemplate"
              >
                <v-progress-circular
                  v-if="downloadingTemplate"
                  indeterminate
                  size="16"
                  width="2"
                />
                <v-icon v-else size="16">mdi-download</v-icon>
                {{ t('dealer.views.vehicles.import.downloadTemplate') }}
              </button>
            </div>

            <div class="import-dialog__sample">
              <div class="import-dialog__sample-header">
                <span class="import-dialog__sample-title">
                  {{ t('dealer.views.vehicles.import.sampleTitle') }}
                </span>
                <span class="import-dialog__sample-hint">
                  {{ t('dealer.views.vehicles.import.sampleHint') }}
                </span>
              </div>

              <div class="import-dialog__table-scroll">
                <v-table density="compact" class="import-dialog__sample-table">
                  <thead>
                    <tr>
                      <th
                        v-for="header in sampleHeaders"
                        :key="header"
                        class="text-caption font-weight-medium"
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
              </div>
            </div>
          </div>
        </section>

        <section class="import-dialog__section" aria-labelledby="import-upload-heading">
          <h3 id="import-upload-heading" class="panel-detail-dialog__section-title">
            {{ t('dealer.views.vehicles.import.stepUpload') }}
          </h3>

          <div
            class="import-dialog__dropzone"
            :class="{
              'import-dialog__dropzone--active': dragOver,
              'import-dialog__dropzone--filled': !!importFile,
              'import-dialog__dropzone--disabled': importing,
            }"
            @click="openFilePicker"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              class="import-dialog__file-input"
              accept=".xlsx,.xls,.csv"
              :disabled="importing"
              @change="onNativeFileChange"
            />

            <template v-if="importFile">
              <v-icon size="28" color="primary">mdi-file-check-outline</v-icon>
              <div class="import-dialog__dropzone-file">
                <span class="import-dialog__dropzone-filename">{{ importFile.name }}</span>
                <span class="import-dialog__dropzone-filesize">{{ formatFileSize(importFile.size) }}</span>
              </div>
              <button
                type="button"
                class="panel-btn panel-btn--ghost panel-btn--sm"
                :disabled="importing"
                @click.stop="clearFile"
              >
                {{ t('dealer.views.vehicles.import.removeFile') }}
              </button>
            </template>

            <template v-else>
              <v-icon size="32" color="primary">mdi-cloud-upload-outline</v-icon>
              <span class="import-dialog__dropzone-title">
                {{ t('dealer.views.vehicles.import.dropZoneTitle') }}
              </span>
              <span class="import-dialog__dropzone-hint">
                {{ t('dealer.views.vehicles.import.dropZoneHint') }}
              </span>
            </template>
          </div>
        </section>

        <section
          v-if="result"
          class="import-dialog__section"
          aria-labelledby="import-results-heading"
        >
          <div class="import-dialog__results-header">
            <h3 id="import-results-heading" class="panel-detail-dialog__section-title mb-0">
              {{ t('dealer.views.vehicles.import.stepReview') }}
            </h3>

            <v-btn-toggle
              v-if="result.rows.length > 0"
              v-model="resultsFilter"
              density="compact"
              variant="outlined"
              divided
              mandatory
            >
              <v-btn value="issues" size="small">
                {{ t('dealer.views.vehicles.import.showIssuesOnly') }}
              </v-btn>
              <v-btn value="all" size="small">
                {{ t('dealer.views.vehicles.import.showAllRows') }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <div class="panel-detail-dialog__summary import-dialog__summary">
            <span
              class="panel-status-chip"
              :class="dryRunLast ? 'panel-status-chip--info' : 'panel-status-chip--success'"
            >
              {{
                dryRunLast
                  ? `${t('dealer.views.vehicles.import.validated')}: ${result.summary.validated ?? 0}`
                  : `${t('dealer.views.vehicles.import.created')}: ${result.summary.created}`
              }}
            </span>
            <span class="panel-status-chip import-dialog__chip--error">
              {{ t('dealer.views.vehicles.import.failed') }}: {{ result.summary.failed }}
            </span>
            <span class="panel-status-chip panel-status-chip--warning">
              {{ t('dealer.views.vehicles.import.warnings') }}: {{ result.summary.warnings }}
            </span>
            <span class="panel-detail-dialog__summary-meta">
              {{ t('dealer.views.vehicles.import.totalRows', { count: result.rows.length }) }}
            </span>
          </div>

          <div v-if="displayedRows.length === 0" class="import-dialog__empty-results">
            <v-icon size="22" color="success">mdi-check-circle-outline</v-icon>
            <span>{{ t('dealer.views.vehicles.import.noIssuesFound') }}</span>
          </div>

          <div v-else class="import-dialog__table-scroll import-dialog__table-scroll--results">
            <v-table density="compact" class="import-dialog__results-table">
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
                  v-for="row in displayedRows"
                  :key="row.row"
                  :class="{ 'import-dialog__row--failed': row.status === 'failed' }"
                >
                  <td class="import-dialog__row-num">{{ row.row }}</td>
                  <td>{{ row.registration || '—' }}</td>
                  <td>
                    <span
                      class="panel-status-chip"
                      :class="statusChipClass(row.status)"
                    >
                      {{ statusLabel(row.status) }}
                    </span>
                  </td>
                  <td class="import-dialog__details-cell">
                    <ul
                      v-if="row.errors.length"
                      class="import-dialog__message-list import-dialog__message-list--error"
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
                      class="import-dialog__message-list import-dialog__message-list--warning"
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
          </div>

          <p
            v-if="!dryRunLast && result.summary.created > 0"
            class="import-dialog__images-note"
          >
            <v-icon size="14" class="mr-1">mdi-image-multiple-outline</v-icon>
            {{ t('dealer.views.vehicles.import.imagesNote') }}
          </p>
        </section>
      </div>

      <div class="panel-detail-dialog__footer">
        <p class="text-caption text-medium-emphasis mb-3 text-center">
          {{ t('dealer.views.vehicles.import.importFooterHint') }}
        </p>
        <div class="panel-inline-actions">
          <button
            type="button"
            class="panel-btn panel-btn--ghost"
            :disabled="importing"
            @click="close"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="panel-btn panel-btn--outline"
            :disabled="!importFile || importing"
            @click="runImport(true)"
          >
            <v-progress-circular
              v-if="importing && dryRunLast"
              indeterminate
              size="16"
              width="2"
            />
            <v-icon v-else size="16">mdi-check-circle-outline</v-icon>
            {{ t('dealer.views.vehicles.import.validateOnly') }}
          </button>
          <button
            type="button"
            class="panel-btn panel-btn--primary"
            :disabled="!importFile || importing"
            @click="runImport(false)"
          >
            <v-progress-circular
              v-if="importing && !dryRunLast"
              indeterminate
              size="16"
              width="2"
              color="white"
            />
            <v-icon v-else size="16">mdi-upload</v-icon>
            {{ t('dealer.views.vehicles.import.import') }}
          </button>
        </div>
      </div>
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
  type VehicleImportSample,
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
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const downloadingTemplate = ref(false)
const importing = ref(false)
const importingDryRun = ref(false)
const importError = ref<string | null>(null)
const result = ref<VehicleImportResult | null>(null)
const dryRunLast = ref(false)
const resultsFilter = ref<'issues' | 'all'>('issues')
let dragDepth = 0

const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error' | 'info' | 'warning',
})

const sampleHeaders = ref<string[]>([])
const sampleRow = ref<Record<string, string>>({})
const usageNotice = ref<VehicleImportSample['usage_notice']>(null)

const importFile = computed(() => {
  if (!selectedFiles.value) return null
  if (Array.isArray(selectedFiles.value)) {
    return selectedFiles.value[0] ?? null
  }
  return selectedFiles.value
})

const currentStep = computed(() => {
  if (result.value) return 3
  if (importFile.value) return 2
  return 1
})

const displayedRows = computed(() => {
  if (!result.value) return []
  if (resultsFilter.value === 'all') return result.value.rows
  return result.value.rows.filter(
    (row) =>
      row.status === 'failed'
      || row.errors.length > 0
      || row.warnings.length > 0
      || row.status.includes('warnings')
  )
})

function setSelectedFile(file: File | null) {
  selectedFiles.value = file
}

function clearFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function openFilePicker() {
  if (importing.value) return
  fileInputRef.value?.click()
}

function onNativeFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return

  if (!isAcceptedFile(file)) {
    importError.value = t('dealer.views.vehicles.import.invalidFileType')
    clearFileInput()
    return
  }

  setSelectedFile(file)
  clearFileInput()
  result.value = null
  importError.value = null
}

function onDragEnter() {
  if (importing.value) return
  dragDepth += 1
  dragOver.value = true
}

function onDragOver() {
  if (importing.value) return
  dragOver.value = true
}

function onDragLeave() {
  dragDepth -= 1
  if (dragDepth <= 0) {
    dragDepth = 0
    dragOver.value = false
  }
}

function onDrop(event: DragEvent) {
  dragDepth = 0
  dragOver.value = false
  if (importing.value) return

  const file = event.dataTransfer?.files?.[0] ?? null
  if (!file) return

  if (!isAcceptedFile(file)) {
    importError.value = t('dealer.views.vehicles.import.invalidFileType')
    return
  }

  setSelectedFile(file)
  result.value = null
  importError.value = null
}

function isAcceptedFile(file: File) {
  const name = file.name.toLowerCase()
  return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')
}

function clearFile() {
  setSelectedFile(null)
  clearFileInput()
  result.value = null
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function loadSample() {
  try {
    const data = await getVehicleImportSample()
    sampleHeaders.value = data.headers
    sampleRow.value = data.row
    usageNotice.value = data.usage_notice ?? null
  } catch {
    sampleHeaders.value = [
      'Registrering',
      'Mærke',
      'Model',
      'Brændstof',
      'Salgstype',
      'Pris',
      'Kilometer',
      'Geartype',
      'Billeder',
    ]
    sampleRow.value = {
      Registrering: 'AB12345',
      Mærke: 'Volvo',
      Model: 'XC60',
      Brændstof: 'Benzin',
      Salgstype: 'Køb',
      Pris: '249900',
      Kilometer: '85000',
      Geartype: 'Automatisk',
      Billeder: 'https://example.com/billede1.jpg',
    }
  }
}

function syncResultsFilter() {
  if (!result.value) return
  const hasIssues =
    (result.value.summary.failed ?? 0) > 0
    || (result.value.summary.warnings ?? 0) > 0
  resultsFilter.value = hasIssues ? 'issues' : 'all'
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      loadSample()
      result.value = null
      importError.value = null
      setSelectedFile(null)
      clearFileInput()
      resultsFilter.value = 'issues'
      dragOver.value = false
      dragDepth = 0
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
    const valid = data.rows.filter((r) =>
      r.status === 'validated' || r.status === 'validated_with_warnings'
    ).length
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
    importingDryRun.value = dryRun
    dryRunLast.value = dryRun
    importError.value = null
    result.value = null

    const data = await importVehicles(file, { dryRun })

    result.value = data
    syncResultsFilter()
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

function statusChipClass(status: string) {
  if (status === 'failed') return 'import-dialog__chip--error'
  if (status === 'created_with_warnings' || status === 'validated_with_warnings') {
    return 'panel-status-chip--warning'
  }
  if (status === 'validated' || status === 'created') return 'panel-status-chip--success'
  return 'panel-status-chip--neutral'
}

function statusLabel(status: string) {
  const key = `dealer.views.vehicles.import.status.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}
</script>

<style scoped>
.import-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.import-dialog__alert {
  margin-bottom: 0 !important;
}

.import-dialog__steps {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.import-dialog__step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  position: relative;
  padding-right: 0.75rem;
}

.import-dialog__step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 0.75rem;
  height: 1px;
  background: var(--border);
  transform: translateY(-50%);
}

.import-dialog__step-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
  color: var(--muted-foreground);
  background: var(--muted);
  border: 1px solid var(--border);
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.import-dialog__step-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.import-dialog__step--active .import-dialog__step-marker {
  color: var(--primary);
  background: color-mix(in oklch, var(--primary) 12%, var(--card));
  border-color: color-mix(in oklch, var(--primary) 35%, var(--border));
}

.import-dialog__step--active .import-dialog__step-label {
  color: var(--foreground);
}

.import-dialog__step--done .import-dialog__step-marker {
  color: #ffffff;
  background: var(--primary);
  border-color: var(--primary);
}

.import-dialog__intro {
  margin-bottom: 0 !important;
}

.import-dialog__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.import-dialog__prepare-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  overflow: hidden;
}

.import-dialog__prepare-actions {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklch, var(--muted) 35%, var(--card));
}

.import-dialog__sample {
  padding: 0.875rem 1rem 1rem;
}

.import-dialog__sample-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.import-dialog__sample-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--foreground);
}

.import-dialog__sample-hint {
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--muted-foreground);
}

.import-dialog__table-scroll {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: color-mix(in oklch, var(--muted) 20%, var(--card));
}

.import-dialog__table-scroll--results {
  max-height: 280px;
  overflow-y: auto;
}

.import-dialog__sample-table,
.import-dialog__results-table {
  background: transparent;
}

.import-dialog__sample-table th,
.import-dialog__sample-table td,
.import-dialog__results-table th,
.import-dialog__results-table td {
  white-space: nowrap;
}

.import-dialog__sample-table th,
.import-dialog__results-table th {
  background: color-mix(in oklch, var(--muted) 45%, var(--card));
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
}

.import-dialog__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 9rem;
  padding: 1.25rem 1rem;
  border: 1.5px dashed color-mix(in oklch, var(--primary) 35%, var(--border));
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--primary) 4%, var(--card));
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
}

.import-dialog__dropzone:hover:not(.import-dialog__dropzone--disabled) {
  border-color: var(--primary);
  background: color-mix(in oklch, var(--primary) 8%, var(--card));
}

.import-dialog__dropzone--active {
  border-color: var(--primary);
  background: color-mix(in oklch, var(--primary) 10%, var(--card));
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 12%, transparent);
}

.import-dialog__dropzone--filled {
  border-style: solid;
  background: var(--card);
}

.import-dialog__dropzone--disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.import-dialog__file-input {
  display: none;
}

.import-dialog__dropzone-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
}

.import-dialog__dropzone-hint {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.import-dialog__dropzone-file {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  max-width: 100%;
}

.import-dialog__dropzone-filename {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
  word-break: break-all;
}

.import-dialog__dropzone-filesize {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.import-dialog__results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.import-dialog__summary {
  margin-bottom: 0 !important;
}

.import-dialog__chip--error {
  background: color-mix(in oklch, var(--destructive) 88%, #ffffff);
  color: #ffffff;
}

.import-dialog__empty-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--success) 8%, var(--card));
  font-size: 0.8125rem;
  color: var(--foreground);
}

.import-dialog__row--failed {
  background: color-mix(in oklch, var(--destructive) 5%, transparent);
}

.import-dialog__row-num {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--muted-foreground);
}

.import-dialog__details-cell {
  white-space: normal !important;
  min-width: 12rem;
  max-width: 24rem;
}

.import-dialog__message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  line-height: 1.45;
}

.import-dialog__message-list li + li {
  margin-top: 0.25rem;
}

.import-dialog__message-list--error {
  color: var(--destructive);
}

.import-dialog__message-list--warning {
  color: #b45309;
}

.import-dialog__images-note {
  display: flex;
  align-items: flex-start;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--muted-foreground);
}

@media (max-width: 640px) {
  .import-dialog__steps {
    flex-direction: column;
    align-items: stretch;
  }

  .import-dialog__step:not(:last-child)::after {
    display: none;
  }

  .import-dialog__step-label {
    white-space: normal;
  }

  .panel-detail-dialog__footer .panel-inline-actions {
    width: 100%;
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .panel-detail-dialog__footer .panel-btn {
    width: 100%;
  }
}
</style>
