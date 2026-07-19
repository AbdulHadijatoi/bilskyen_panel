<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="panel-detail-dialog" variant="flat">
      <div class="panel-detail-dialog__header">
        <h2 class="panel-detail-dialog__title">
          <v-icon size="20">mdi-link-variant</v-icon>
          {{ t('dealer.views.vehicles.urlImport.publishTitle') }}
        </h2>
        <button
          type="button"
          class="panel-icon-btn"
          :aria-label="t('common.close')"
          :disabled="busy"
          @click="close"
        >
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <div class="panel-detail-dialog__body">
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ t('dealer.views.vehicles.urlImport.publishDescription') }}
        </p>

        <v-text-field
          v-model="url"
          :label="t('dealer.views.vehicles.urlImport.urlLabel')"
          :placeholder="t('dealer.views.vehicles.urlImport.urlPlaceholder')"
          variant="outlined"
          hide-details="auto"
          :disabled="busy"
          class="mb-3"
          @keyup.enter="runPreview"
        />

        <v-select
          v-model="salesTypeId"
          :items="salesTypeItems"
          item-title="name"
          item-value="id"
          :label="t('dealer.views.vehicles.urlImport.salesType')"
          variant="outlined"
          hide-details="auto"
          :disabled="busy || salesTypes.length === 0"
          class="mb-3"
        />

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="importWarnings.length > 0"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div v-for="(warning, index) in importWarnings" :key="`import-warn-${index}`">
            {{ warning }}
          </div>
        </v-alert>

        <div v-if="preview" class="preview-box pa-3 mb-2">
          <div class="text-subtitle-2 mb-2">{{ preview.title || t('dealer.views.vehicles.urlImport.previewReady') }}</div>
          <div class="text-body-2">
            <div v-if="preview.registration">
              {{ t('dealer.views.vehicles.urlImport.registration') }}: {{ preview.registration }}
            </div>
            <div v-if="preview.price != null">
              {{ t('dealer.views.vehicles.urlImport.price') }}: {{ preview.price }}
            </div>
            <div v-if="preview.mileage != null">
              {{ t('dealer.views.vehicles.urlImport.mileage') }}: {{ preview.mileage }}
            </div>
            <div>
              {{ t('dealer.views.vehicles.urlImport.imagesCount', { count: preview.image_urls?.length || 0 }) }}
            </div>
          </div>
          <v-alert
            v-for="(warning, index) in preview.warnings || []"
            :key="`warn-${index}`"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ warning }}
          </v-alert>
        </div>
      </div>

      <div class="panel-detail-dialog__footer d-flex justify-end ga-2 pa-4">
        <v-btn variant="outlined" :disabled="busy" @click="close">
          {{ t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          :loading="previewLoading"
          :disabled="!url.trim() || importing"
          @click="runPreview"
        >
          {{ t('dealer.views.vehicles.urlImport.preview') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="importing"
          :disabled="!preview || !salesTypeId || previewLoading"
          @click="runImport"
        >
          {{ t('dealer.views.vehicles.urlImport.importAndPublish') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getLookupConstants,
  importVehicleFromUrl,
  previewVehicleFromUrl,
  type BilbasenUrlImportPreview,
} from '@/api/dealer.api'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  imported: [vehicleId: number, warnings?: string[]]
}>()

const { t } = useI18n()

const url = ref('')
const salesTypeId = ref<number | null>(null)
const salesTypes = ref<Array<{ id: number; name: string }>>([])
const preview = ref<BilbasenUrlImportPreview | null>(null)
const previewLoading = ref(false)
const importing = ref(false)
const error = ref<string | null>(null)
const importWarnings = ref<string[]>([])

const salesTypeItems = computed(() => salesTypes.value)
const busy = computed(() => previewLoading.value || importing.value)

const apiErrorMessage = (e: any, fallback: string): string =>
  e?.response?.data?.message || e?.message || fallback

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      url.value = ''
      preview.value = null
      error.value = null
      importWarnings.value = []
      const firstSalesType = salesTypes.value[0]
      if (!salesTypeId.value && firstSalesType) {
        salesTypeId.value = firstSalesType.id
      }
    }
  }
)

watch(url, () => {
  if (preview.value) {
    preview.value = null
  }
  if (importWarnings.value.length > 0) {
    importWarnings.value = []
  }
})

onMounted(async () => {
  try {
    const data = await getLookupConstants()
    salesTypes.value = data.sales_types || []
    const firstSalesType = salesTypes.value[0]
    if (!salesTypeId.value && firstSalesType) {
      salesTypeId.value = firstSalesType.id
    }
  } catch (e: any) {
    error.value = apiErrorMessage(e, t('dealer.views.vehicles.urlImport.salesTypesLoadFailed'))
  }
})

const close = () => {
  if (busy.value) return
  emit('update:modelValue', false)
}

const runPreview = async () => {
  if (!url.value.trim()) {
    error.value = t('dealer.views.vehicles.urlImport.urlRequired')
    return
  }
  previewLoading.value = true
  error.value = null
  importWarnings.value = []
  preview.value = null
  try {
    preview.value = await previewVehicleFromUrl(url.value.trim())
  } catch (e: any) {
    error.value = apiErrorMessage(e, t('dealer.views.vehicles.urlImport.previewFailed'))
  } finally {
    previewLoading.value = false
  }
}

const runImport = async () => {
  if (!preview.value || !salesTypeId.value) {
    error.value = t('dealer.views.vehicles.urlImport.salesTypeRequired')
    return
  }
  const publishUrl = (preview.value.source_url || url.value).trim()
  if (!publishUrl) {
    error.value = t('dealer.views.vehicles.urlImport.urlRequired')
    return
  }
  importing.value = true
  error.value = null
  importWarnings.value = []
  try {
    const result = await importVehicleFromUrl({
      url: publishUrl,
      sales_type_id: salesTypeId.value,
    })
    const warningMessages = (result.warnings || [])
      .map((w) => w.message)
      .filter((message): message is string => typeof message === 'string' && message !== '')
    emit('imported', result.vehicle_id, warningMessages)
    emit('update:modelValue', false)
  } catch (e: any) {
    error.value = apiErrorMessage(e, t('dealer.views.vehicles.urlImport.publishFailed'))
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.preview-box {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.25);
}
</style>
