<template>
  <div class="branding-field" :class="{ 'branding-field--flush': flush }">
    <div class="branding-field__header">
      <span class="branding-field__label">{{ label }}</span>
      <PanelHelpHint
        :text="helpText"
        size="sm"
        :max-width="380"
        location="top start"
        :aria-label="ariaLabel"
      />
    </div>
    <div v-if="$slots.default" class="branding-field__control">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'

interface Props {
  label: string
  helpKey: string
  flush?: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()

const helpText = computed(() => t(`dealer.views.branding.help.${props.helpKey}`))
const ariaLabel = computed(() => t('dealer.views.branding.helpAria'))
</script>

<style scoped>
.branding-field {
  margin-bottom: 1rem;
}

.branding-field--flush {
  margin-bottom: 0.5rem;
}

.branding-field__header {
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.branding-field__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.35;
  flex: 1;
  min-width: 0;
}

.branding-field__control :deep(.v-input) {
  margin-top: 0;
}
</style>
