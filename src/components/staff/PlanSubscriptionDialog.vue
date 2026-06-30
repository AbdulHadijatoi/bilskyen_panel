<template>
  <DealerPlanSubscriptionDialog
    v-bind="$attrs"
    :plan="plan"
    :show="show"
    :loading="loading"
    @confirm="$emit('confirm', $event)"
    @close="$emit('close')"
  />
</template>

<script setup lang="ts">
import DealerPlanSubscriptionDialog from '@/components/dealer/PlanSubscriptionDialog.vue'
import type { PlanModel } from '@/api/dealer.api'

defineProps<{
  plan: PlanModel | null
  show: boolean
  loading?: boolean
}>()

defineEmits<{
  confirm: [billingCycle: 'monthly' | 'yearly' | 'usage_daily']
  close: []
}>()
</script>
