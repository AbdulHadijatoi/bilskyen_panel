<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <v-select
          v-model="selectedMonth"
          :items="months"
          :label="monthLabel"
          density="compact"
          variant="outlined"
          :rules="rules"
          :readonly="readonly"
          :disabled="disabled"
          :hint="hint && !label ? hint : undefined"
          :persistent-hint="persistentHint && !label"
          hide-details="auto"
          @update:model-value="updateValue"
        />
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="selectedYear"
          :items="years"
          :label="yearLabel"
          density="compact"
          variant="outlined"
          :rules="rules"
          :readonly="readonly"
          :disabled="disabled"
          :hint="hint && !label ? hint : undefined"
          :persistent-hint="persistentHint && !label"
          hide-details="auto"
          @update:model-value="updateValue"
        />
      </v-col>
    </v-row>
    <div v-if="hint && label && persistentHint" class="text-caption text-medium-emphasis mt-1">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  rules?: any[]
  readonly?: boolean
  disabled?: boolean
  hint?: string
  persistentHint?: boolean
  minYear?: number
  maxYear?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  rules: () => [],
  readonly: false,
  disabled: false,
  hint: '',
  persistentHint: false,
  minYear: 1900,
  maxYear: () => new Date().getFullYear() + 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const months = [
  { title: 'January', value: '01' },
  { title: 'February', value: '02' },
  { title: 'March', value: '03' },
  { title: 'April', value: '04' },
  { title: 'May', value: '05' },
  { title: 'June', value: '06' },
  { title: 'July', value: '07' },
  { title: 'August', value: '08' },
  { title: 'September', value: '09' },
  { title: 'October', value: '10' },
  { title: 'November', value: '11' },
  { title: 'December', value: '12' },
]

const years = computed(() => {
  const yearList = []
  for (let year = props.maxYear; year >= props.minYear; year--) {
    yearList.push({ title: String(year), value: String(year) })
  }
  return yearList
})

const selectedMonth = ref<string>('')
const selectedYear = ref<string>('')

// Computed labels for month and year fields
const monthLabel = computed(() => {
  if (props.label) {
    return `${props.label} Month`
  }
  return 'Month'
})

const yearLabel = computed(() => {
  if (props.label) {
    return `${props.label} Year`
  }
  return 'Year'
})

// Parse modelValue (format: "YYYY-MM")
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = newValue.split('-')
      selectedYear.value = year
      selectedMonth.value = month
    } else if (!newValue) {
      selectedYear.value = ''
      selectedMonth.value = ''
    }
  },
  { immediate: true }
)

const updateValue = () => {
  if (selectedYear.value && selectedMonth.value) {
    const value = `${selectedYear.value}-${selectedMonth.value}`
    emit('update:modelValue', value)
  } else {
    emit('update:modelValue', '')
  }
}
</script>

<style scoped>
/* No custom styles needed - using Vuetify components */
</style>
