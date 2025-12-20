<template>
  <v-menu location="bottom">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        class="mr-2"
      >
        <v-icon>{{ themeStore.isDark.value ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        prepend-icon="mdi-weather-sunny"
        title="Light"
        :active="themeStore.currentTheme === 'light'"
        @click="handleThemeChange('light')"
      />
      <v-list-item
        prepend-icon="mdi-weather-night"
        title="Dark"
        :active="themeStore.currentTheme === 'dark'"
        @click="handleThemeChange('dark')"
      />
      <v-list-item
        prepend-icon="mdi-monitor"
        title="System"
        :active="themeStore.currentTheme === 'system'"
        @click="handleThemeChange('system')"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
  themeStore.setTheme(theme)
}
</script>


