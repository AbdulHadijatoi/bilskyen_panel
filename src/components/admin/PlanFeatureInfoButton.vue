<template>
  <v-menu
    location="right"
    open-on-hover
    :open-delay="150"
    :close-delay="250"
    :close-on-content-click="false"
    :max-width="mode === 'dealer' ? 280 : 360"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="plan-comparison__info-btn"
        v-bind="menuProps"
        :aria-label="buttonAriaLabel"
      >
        !
      </button>
    </template>

    <v-card class="plan-comparison__info-card" variant="flat">
      <v-card-text class="pa-3">
        <template v-if="mode === 'dealer'">
          <div class="plan-comparison__info-section-label">
            {{ t('dealer.views.subscription.whatItDoes') }}
          </div>
          <p class="plan-comparison__info-text mb-0">
            {{ dealerDescription }}
          </p>
        </template>

        <template v-else>
          <div class="plan-comparison__info-title">{{ featureLabel }}</div>

          <div class="plan-comparison__info-meta">
            <span v-if="category" class="plan-comparison__info-chip">{{ categoryLabel }}</span>
            <span class="plan-comparison__info-chip">{{ valueTypeLabel }}</span>
            <code class="plan-comparison__info-key">{{ featureKey }}</code>
          </div>

          <div class="plan-comparison__info-section-label">
            {{ t('admin.views.plans.featureInfo.description') }}
          </div>
          <p class="plan-comparison__info-text">
            {{ primaryDescription }}
          </p>
          <p v-if="showExtendedHelp" class="plan-comparison__info-text plan-comparison__info-text--muted">
            {{ extendedHelp }}
          </p>

          <div class="plan-comparison__info-section-label">
            {{ t('admin.views.plans.featureInfo.testLocation') }}
          </div>
          <p v-if="testGuide" class="plan-comparison__info-text mb-1">
            {{ t(`admin.views.plans.featureTestLocations.${testGuide.locationKey}`) }}
          </p>
          <p v-else class="plan-comparison__info-text mb-1">
            {{ t('admin.views.plans.featureInfo.noTestLocation') }}
          </p>
          <code v-if="testGuide" class="plan-comparison__info-path">{{ testGuide.dealerPath }}</code>
          <p v-if="verifyHelp" class="plan-comparison__info-text plan-comparison__info-text--hint mt-2 mb-0">
            {{ verifyHelp }}
          </p>

          <v-btn
            v-if="featureId"
            :to="`/admin/features/${featureId}`"
            variant="text"
            color="primary"
            size="small"
            class="plan-comparison__info-link mt-2 px-0"
          >
            {{ t('admin.views.plans.featureInfo.viewFeature') }}
            <v-icon end size="14">mdi-arrow-right</v-icon>
          </v-btn>
        </template>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getFeatureHelpI18nKey,
  getFeatureTestGuide,
  getFeatureVerifyI18nKey,
} from '@/utils/featureAdminGuide'
import type { FeatureCategory } from '@/utils/planFeatureGroups'

const props = withDefaults(
  defineProps<{
    mode?: 'admin' | 'dealer'
    featureKey: string
    featureId?: number
    featureLabel: string
    description?: string | null
    category?: FeatureCategory
    valueTypeId?: number
  }>(),
  {
    mode: 'admin',
  }
)

const { t, te } = useI18n()

const buttonAriaLabel = computed(() =>
  props.mode === 'dealer'
    ? t('dealer.views.subscription.featureInfoButtonLabel', { feature: props.featureLabel })
    : t('admin.views.plans.featureInfo.buttonLabel', { feature: props.featureLabel })
)

const testGuide = computed(() => getFeatureTestGuide(props.featureKey))

const categoryLabel = computed(() =>
  props.category ? t(`subscription.comparison.categories.${props.category}`) : ''
)

const valueTypeLabel = computed(() => {
  if (props.valueTypeId === 1) return t('admin.views.plans.featureInfo.typeBoolean')
  if (props.valueTypeId === 2) return t('admin.views.plans.featureInfo.typeNumber')
  if (props.valueTypeId === 3) return t('admin.views.plans.featureInfo.typeText')
  return t('admin.views.plans.featureInfo.typeUnknown')
})

function translateIfExists(key: string): string | null {
  if (!te(key)) return null
  const value = t(key)
  return value === key ? null : value
}

const extendedHelp = computed(() => translateIfExists(getFeatureHelpI18nKey(props.featureKey)))

const verifyHelp = computed(() => translateIfExists(getFeatureVerifyI18nKey(props.featureKey)))

const dealerDescription = computed(() => {
  const help = extendedHelp.value
  if (help) return help
  const db = props.description?.trim()
  if (db) return db
  return t('dealer.views.subscription.noFeatureDescription')
})

const primaryDescription = computed(() => {
  const db = props.description?.trim()
  if (db) return db
  if (extendedHelp.value) return extendedHelp.value
  return t('admin.views.plans.featureInfo.noDescription')
})

const showExtendedHelp = computed(() => {
  const db = props.description?.trim()
  return Boolean(db && extendedHelp.value && extendedHelp.value !== db)
})
</script>
