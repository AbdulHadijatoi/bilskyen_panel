<template>
  <div v-if="plans.length > 0 && groups.length > 0" class="plan-comparison">
    <div class="plan-comparison__header">
      <h2 class="plan-comparison__title">{{ title || t('subscription.comparison.title') }}</h2>
      <p v-if="subtitle || !title" class="plan-comparison__subtitle">
        {{ subtitle || t('subscription.comparison.subtitle') }}
      </p>
    </div>

    <div class="plan-comparison__scroll">
      <table class="plan-comparison__table">
        <thead>
          <tr>
            <th class="plan-comparison__feature-col">{{ t('subscription.comparison.feature') }}</th>
            <th
              v-for="plan in plans"
              :key="plan.id"
              :class="[
                'plan-comparison__plan-col',
                { 'plan-comparison__plan-col--active': highlightColumn && activePlanId === plan.id },
              ]"
            >
              <span class="plan-comparison__plan-name">{{ plan.name }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groups" :key="group.category">
            <tr class="plan-comparison__category-row">
              <td :colspan="plans.length + 1">
                {{ t(`subscription.comparison.categories.${group.category}`) }}
              </td>
            </tr>
            <tr
              v-for="row in group.rows"
              :key="row.featureKey"
              class="plan-comparison__feature-row"
            >
              <td class="plan-comparison__feature-col">
                <div class="plan-comparison__feature-name">
                  <span class="plan-comparison__feature-label">{{ row.label }}</span>
                  <PlanFeatureInfoButton
                    v-if="featureInfoMode !== 'none'"
                    :mode="featureInfoMode"
                    :feature-key="row.featureKey"
                    :feature-id="row.featureId"
                    :feature-label="row.label"
                    :description="row.description"
                    :category="row.category"
                    :value-type-id="row.valueTypeId"
                  />
                </div>
              </td>
              <td
                v-for="plan in plans"
                :key="`${row.featureKey}-${plan.id}`"
                :class="[
                  'plan-comparison__cell',
                  { 'plan-comparison__plan-col--active': highlightColumn && activePlanId === plan.id },
                ]"
              >
                <template v-if="row.cells[plan.id]?.type === 'boolean'">
                  <v-icon size="18" color="success" class="plan-comparison__check">mdi-check-circle</v-icon>
                </template>
                <template v-else-if="row.cells[plan.id]?.type === 'value'">
                  <span class="plan-comparison__value">{{ (row.cells[plan.id] as { type: 'value'; display: string }).display }}</span>
                </template>
                <template v-else>
                  <span class="plan-comparison__dash">—</span>
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PlanLike } from '@/composables/usePlanDisplay'
import { buildComparisonMatrix } from '@/utils/planFeatureGroups'
import PlanFeatureInfoButton from '@/components/admin/PlanFeatureInfoButton.vue'

const props = withDefaults(
  defineProps<{
    plans: PlanLike[]
    activePlanId?: number | null
    highlightColumn?: boolean
    title?: string
    subtitle?: string
    featureInfoMode?: 'none' | 'admin' | 'dealer'
  }>(),
  {
    activePlanId: null,
    highlightColumn: true,
    featureInfoMode: 'none',
  }
)

const { t, locale } = useI18n()

const groups = computed(() => buildComparisonMatrix(props.plans, locale.value))
</script>
