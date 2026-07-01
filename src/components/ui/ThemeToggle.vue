<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="text"
        size="small"
        icon
        class="theme-toggle-btn"
        :style="{
          width: '28px',
          height: '28px',
          minWidth: '28px',
          minHeight: '28px',
        }"
        :aria-label="t('dealerComponents.themeToggle.toggleTheme')"
      >
        <v-icon
          v-if="!themeStore.isDark"
          size="20"
          class="theme-icon-sun"
          :style="{
            transform: 'scale(1) rotate(0deg)',
            transition: 'transform 0.2s',
          }"
        >
          mdi-weather-sunny
        </v-icon>
        <v-icon
          v-else
          size="20"
          class="theme-icon-moon"
          :style="{
            transform: 'scale(1) rotate(0deg)',
            transition: 'transform 0.2s',
          }"
        >
          mdi-weather-night
        </v-icon>
        <span class="sr-only">{{ t('dealerComponents.themeToggle.toggleTheme') }}</span>
      </v-btn>
    </template>
    <v-list
      density="compact"
      :style="{
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
      }"
    >
      <v-list-item
        :active="themeStore.currentTheme === 'light'"
        @click="themeStore.setTheme('light')"
        :style="{
          backgroundColor: themeStore.currentTheme === 'light' ? 'var(--accent)' : 'transparent',
          color: themeStore.currentTheme === 'light' ? 'var(--accent-foreground)' : 'var(--foreground)',
        }"
      >
        <template #prepend>
          <v-icon size="16">mdi-weather-sunny</v-icon>
        </template>
        <v-list-item-title>{{ t('dealerComponents.themeToggle.light') }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="themeStore.currentTheme === 'dark'"
        @click="themeStore.setTheme('dark')"
        :style="{
          backgroundColor: themeStore.currentTheme === 'dark' ? 'var(--accent)' : 'transparent',
          color: themeStore.currentTheme === 'dark' ? 'var(--accent-foreground)' : 'var(--foreground)',
        }"
      >
        <template #prepend>
          <v-icon size="16">mdi-weather-night</v-icon>
        </template>
        <v-list-item-title>{{ t('dealerComponents.themeToggle.dark') }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="themeStore.currentTheme === 'system'"
        @click="themeStore.setTheme('system')"
        :style="{
          backgroundColor: themeStore.currentTheme === 'system' ? 'var(--accent)' : 'transparent',
          color: themeStore.currentTheme === 'system' ? 'var(--accent-foreground)' : 'var(--foreground)',
        }"
      >
        <template #prepend>
          <v-icon size="16">mdi-monitor</v-icon>
        </template>
        <v-list-item-title>{{ t('dealerComponents.themeToggle.system') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle-btn {
  color: var(--foreground) !important;
}

.theme-toggle-btn:hover {
  background-color: var(--accent) !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
