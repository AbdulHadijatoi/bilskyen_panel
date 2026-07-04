<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ t('dealer.views.bulkPrice.title') }}</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ t('dealer.views.bulkPrice.hint') }}</p>
        <v-textarea
          v-model="csvInput"
          :label="t('dealer.views.bulkPrice.csvLabel')"
          :placeholder="t('dealer.views.bulkPrice.csvPlaceholder')"
          rows="8"
          variant="outlined"
        />
        <v-alert v-if="resultMessage" :type="resultType" variant="tonal" density="compact" class="mt-2">
          {{ resultMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit">{{ t('dealer.views.bulkPrice.apply') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { bulkUpdateVehiclePrices } from '@/api/dealer.api'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; completed: [] }>()

const { t } = useI18n()
const csvInput = ref('')
const loading = ref(false)
const resultMessage = ref('')
const resultType = ref<'success' | 'error' | 'info'>('info')

function parseCsv(text: string): Array<{ vehicle_id: number; price: number }> {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^vehicle[_\s-]?id/i.test(line.split(/[,;\t]/)[0]?.trim() ?? ''))
    .map((line) => {
      const parts = line.split(/[,;\t]/).map((part) => part.trim())
      const vehicleId = parts[0] ?? ''
      const price = parts[1] ?? ''
      return { vehicle_id: parseInt(vehicleId, 10), price: parseFloat(price) }
    })
    .filter((row) => Number.isFinite(row.vehicle_id) && Number.isFinite(row.price) && row.vehicle_id > 0 && row.price >= 0)
}

async function submit() {
  const updates = parseCsv(csvInput.value)
  if (!updates.length) {
    resultMessage.value = t('dealer.views.bulkPrice.invalidInput')
    resultType.value = 'error'
    return
  }

  loading.value = true
  resultMessage.value = ''
  try {
    const result = await bulkUpdateVehiclePrices(updates)
    const errorCount = result.errors ? Object.keys(result.errors).length : 0
    resultMessage.value = t('dealer.views.bulkPrice.result', {
      updated: result.updated,
      skipped: result.skipped,
    }) + (errorCount ? ` ${t('dealer.views.bulkPrice.rowErrors', { count: errorCount })}` : '')
    resultType.value = 'success'
    emit('completed')
  } catch (err: any) {
    resultMessage.value = err?.message || t('dealer.views.bulkPrice.failed')
    resultType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
