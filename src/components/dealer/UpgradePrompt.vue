<template>
  <v-alert
    type="info"
    variant="tonal"
    density="compact"
    class="upgrade-prompt"
  >
    <div class="d-flex align-center justify-space-between flex-wrap gap-2">
      <span class="text-body-2">{{ message || defaultMessage }}</span>
      <v-btn
        size="small"
        color="primary"
        variant="flat"
        :to="{ name: 'dealer.subscription', query: upgradeQuery }"
      >
        {{ t('dealer.views.subscription.upgradePlan') }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { featureDisplayName } from '@/utils/featureDisplay'

const props = defineProps<{
  featureKey: string
  message?: string
}>()

const { t, locale } = useI18n()

const defaultMessage = computed(() =>
  t('dealer.views.subscription.featureLocked', {
    feature: featureDisplayName({ key: props.featureKey }, locale.value),
  })
)

const upgradeQuery = computed(() => ({
  feature: props.featureKey,
}))
</script>

<style scoped>
.upgrade-prompt {
  margin-top: 8px;
}
</style>
