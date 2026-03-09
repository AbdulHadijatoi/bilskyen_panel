<template>
  <v-menu location="bottom">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        class="mr-2"
      >
        <v-icon>{{ themeStore.isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        prepend-icon="mdi-weather-sunny"
        :title="t('dealerComponents.themeToggle.light')"
        :active="themeStore.currentTheme === 'light'"
        @click="handleThemeChange('light')"
      />
      <v-list-item
        prepend-icon="mdi-weather-night"
        :title="t('dealerComponents.themeToggle.dark')"
        :active="themeStore.currentTheme === 'dark'"
        @click="handleThemeChange('dark')"
      />
      <v-list-item
        prepend-icon="mdi-monitor"
        :title="t('dealerComponents.themeToggle.system')"
        :active="themeStore.currentTheme === 'system'"
        @click="handleThemeChange('system')"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()

const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
  themeStore.setTheme(theme)
}
</script>


