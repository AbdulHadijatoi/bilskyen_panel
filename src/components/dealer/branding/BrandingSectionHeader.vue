<template>
  <div class="branding-section-header">
    <h2 class="branding-section-header__title">{{ title }}</h2>
    <PanelHelpHint
      :text="helpText"
      size="sm"
      :max-width="400"
      location="bottom start"
      :aria-label="ariaLabel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'

const props = defineProps<{
  title: string
  helpKey: string
}>()

const { t } = useI18n()

const helpText = computed(() => t(`dealer.views.branding.help.${props.helpKey}`))
const ariaLabel = computed(() => t('dealer.views.branding.helpAria'))
</script>

<style scoped>
.branding-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.branding-section-header__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.3;
}
</style>
