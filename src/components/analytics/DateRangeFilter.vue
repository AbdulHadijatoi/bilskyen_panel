<template>
  <v-select
    v-model="selectedRange"
    :items="dateRangeOptions"
    :label="t('dealer.views.analytics.dateRange.label')"
    variant="outlined"
    density="compact"
    hide-details
    class="date-range-filter"
    @update:model-value="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

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

const { t } = useI18n()
const selectedRange = ref<DateRange>(props.modelValue)

const dateRangeOptions = computed(() => [
  { title: t('dealer.views.analytics.dateRange.last7Days'), value: '7d' as DateRange },
  { title: t('dealer.views.analytics.dateRange.last30Days'), value: '30d' as DateRange },
  { title: t('dealer.views.analytics.dateRange.last3Months'), value: '3m' as DateRange },
  { title: t('dealer.views.analytics.dateRange.lastYear'), value: '1y' as DateRange },
  { title: t('dealer.views.analytics.dateRange.allTime'), value: 'all' as DateRange },
])

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
