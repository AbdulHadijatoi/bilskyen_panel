<template>
  <span class="integration-field-label">
    <span class="integration-field-label__text">{{ label }}</span>
    <PanelHelpHint
      :text="helpText"
      :size="size"
      :aria-label="t('admin.views.integrations.helpAria')"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'

interface Props {
  label: string
  helpKey: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
})

const { t } = useI18n()

const helpText = computed(() => t(`admin.views.integrations.help.${props.helpKey}`))
</script>

<style scoped>
.integration-field-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  max-width: 100%;
}

.integration-field-label__text {
  line-height: 1.35;
}
</style>
