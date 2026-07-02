<template>
  <div class="integration-field" :class="{ 'integration-field--switch': switchField }">
    <template v-if="switchField">
      <div class="integration-field__switch-row">
        <slot />
        <span class="integration-field__label">{{ label }}</span>
        <PanelHelpHint
          :text="helpText"
          size="sm"
          :aria-label="t('admin.views.integrations.helpAria')"
        />
      </div>
    </template>

    <template v-else>
      <div class="integration-field__header">
        <span class="integration-field__label">{{ label }}</span>
        <PanelHelpHint
          :text="helpText"
          size="sm"
          :aria-label="t('admin.views.integrations.helpAria')"
        />
      </div>
      <div class="integration-field__control">
        <slot />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'

interface Props {
  label: string
  helpKey: string
  switchField?: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()

const helpText = computed(() => t(`admin.views.integrations.help.${props.helpKey}`))
</script>

<style scoped>
.integration-field {
  margin-bottom: 0;
}

.integration-field__header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.integration-field__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted-foreground);
  line-height: 1.35;
}

.integration-field__switch-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.integration-field__switch-row .integration-field__label {
  color: var(--foreground);
  flex: 1;
  min-width: 0;
}

.integration-field__control :deep(.v-input) {
  margin-top: 0;
}
</style>
