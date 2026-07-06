<template>
  <PanelToggle
    :model-value="modelValue"
    :options="toggleOptions"
    :aria-label="t('subscription.pricing.billingCycle')"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelToggle from '@/components/ui/PanelToggle.vue'
import type { BillingCycle } from '@/composables/usePlanDisplay'

defineProps<{
  modelValue: BillingCycle
}>()

defineEmits<{
  'update:modelValue': [value: BillingCycle]
}>()

const { t } = useI18n()

const toggleOptions = computed(() => [
  { label: t('admin.views.plans.monthly'), value: 'monthly' as BillingCycle },
  {
    label: t('admin.views.plans.yearly'),
    value: 'yearly' as BillingCycle,
    badge: t('subscription.pricing.yearlyDiscount'),
  },
])
</script>
