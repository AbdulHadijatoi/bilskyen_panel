<template>
  <div class="billing-cycle-toggle">
    <button
      type="button"
      class="billing-cycle-toggle__option"
      :class="{ 'billing-cycle-toggle__option--active': modelValue === 'monthly' }"
      @click="$emit('update:modelValue', 'monthly')"
    >
      {{ t('admin.views.plans.monthly') }}
    </button>
    <button
      type="button"
      class="billing-cycle-toggle__option"
      :class="{ 'billing-cycle-toggle__option--active': modelValue === 'yearly' }"
      @click="$emit('update:modelValue', 'yearly')"
    >
      {{ t('admin.views.plans.yearly') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { BillingCycle } from '@/composables/usePlanDisplay'

defineProps<{
  modelValue: BillingCycle
}>()

defineEmits<{
  'update:modelValue': [value: BillingCycle]
}>()

const { t } = useI18n()
</script>
