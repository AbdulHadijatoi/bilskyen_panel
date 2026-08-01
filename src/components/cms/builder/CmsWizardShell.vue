<template>
  <div class="cms-wizard">
    <PageHeader :title="title" :subtitle="subtitle" show-back :back-to="backTo">
      <template #actions>
        <slot name="header-actions" />
      </template>
    </PageHeader>

    <div class="cms-wizard__steps mb-4">
      <button
        v-for="(step, idx) in steps"
        :key="step.key"
        type="button"
        class="cms-wizard__step"
        :class="{
          'cms-wizard__step--active': idx === modelValue,
          'cms-wizard__step--done': idx < modelValue,
        }"
        @click="$emit('update:modelValue', idx)"
      >
        <span class="cms-wizard__step-num">{{ idx + 1 }}</span>
        <span class="cms-wizard__step-label">{{ step.label }}</span>
      </button>
    </div>

    <div class="cms-wizard__body">
      <slot />
    </div>

    <div class="cms-wizard__footer">
      <v-btn variant="text" :disabled="modelValue === 0 || saving" @click="$emit('update:modelValue', modelValue - 1)">
        {{ t('admin.cms.builder.back') }}
      </v-btn>
      <v-spacer />
      <v-btn variant="outlined" class="mr-2" :loading="saving" :disabled="saving" @click="$emit('save-draft')">
        {{ t('admin.cms.builder.saveDraft') }}
      </v-btn>
      <v-btn
        v-if="modelValue < steps.length - 1"
        color="primary"
        @click="$emit('update:modelValue', modelValue + 1)"
      >
        {{ t('admin.cms.builder.next') }}
      </v-btn>
      <v-btn v-else color="primary" :loading="saving" @click="$emit('publish')">
        {{ t('admin.cms.builder.publish') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import PageHeader from '@/components/panel/PageHeader.vue'

export interface WizardStep {
  key: string
  label: string
}

defineProps<{
  title: string
  subtitle?: string
  backTo: RouteLocationRaw
  steps: WizardStep[]
  modelValue: number
  saving?: boolean
}>()

defineEmits<{
  'update:modelValue': [number]
  'save-draft': []
  publish: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.cms-wizard__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cms-wizard__step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border, #e5e7eb);
  background: var(--card, #fff);
  cursor: pointer;
  font-size: 13px;
  color: var(--muted-foreground, #6b7280);
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.cms-wizard__step--active {
  border-color: var(--primary, #03418b);
  color: var(--primary, #03418b);
  background: color-mix(in srgb, var(--primary, #03418b) 8%, white);
}
.cms-wizard__step--done {
  color: var(--foreground, #111);
}
.cms-wizard__step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  background: var(--muted, #f3f4f6);
}
.cms-wizard__step--active .cms-wizard__step-num {
  background: var(--primary, #03418b);
  color: #fff;
}
.cms-wizard__footer {
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 12px 16px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  background: var(--card, #fff);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
}
</style>
