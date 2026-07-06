<template>
  <nav class="settings-nav" aria-label="Settings navigation">
    <div v-for="group in groups" :key="group.title" class="settings-nav__group">
      <div v-if="group.title" class="settings-nav__group-label">{{ group.title }}</div>
      <button
        v-for="item in group.items"
        :key="item.id"
        type="button"
        class="settings-nav__item"
        :class="{ 'settings-nav__item--active': modelValue === item.id }"
        @click="$emit('update:modelValue', item.id)"
      >
        <v-icon size="16" class="settings-nav__icon">{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { SettingsSection } from '@/stores/settingsModal'

export interface SettingsNavItem {
  id: SettingsSection
  label: string
  icon: string
}

export interface SettingsNavGroup {
  title?: string
  items: SettingsNavItem[]
}

defineProps<{
  modelValue: SettingsSection
  groups: SettingsNavGroup[]
}>()

defineEmits<{
  'update:modelValue': [value: SettingsSection]
}>()
</script>

<style scoped>
.settings-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  min-width: 200px;
  background: var(--muted);
  border-right: 1px solid var(--border);
}

.settings-nav__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.settings-nav__group-label {
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-foreground);
}

.settings-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--sidebar-foreground);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.settings-nav__item:hover {
  background: var(--sidebar-accent);
  color: var(--foreground);
}

.settings-nav__item--active {
  background: var(--card);
  color: var(--foreground);
  box-shadow: var(--shadow-sm);
}

.settings-nav__icon {
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.settings-nav__item--active .settings-nav__icon {
  color: var(--primary);
}
</style>
