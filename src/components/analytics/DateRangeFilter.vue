<template>
  <v-select
    v-model="selectedRange"
    :items="dateRangeOptions"
    label="Date Range"
    variant="outlined"
    density="compact"
    hide-details
    class="date-range-filter"
    @update:model-value="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

export type DateRange = '7d' | '30d' | '3m' | '1y' | 'all'

interface Props {
  modelValue?: DateRange
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '30d',
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

const selectedRange = ref<DateRange>(props.modelValue)

const dateRangeOptions = [
  { title: 'Last 7 days', value: '7d' },
  { title: 'Last 30 days', value: '30d' },
  { title: 'Last 3 months', value: '3m' },
  { title: 'Last year', value: '1y' },
  { title: 'All time', value: 'all' },
]

const handleChange = (value: DateRange) => {
  selectedRange.value = value
  emit('update:modelValue', value)
}

onMounted(() => {
  selectedRange.value = props.modelValue
})
</script>

<style scoped>
.date-range-filter {
  max-width: 200px;
}
</style>
