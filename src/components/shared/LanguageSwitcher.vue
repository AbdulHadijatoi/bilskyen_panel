<template>
  <v-menu v-if="platformSettings.languageSwitcherEnabled" location="bottom end" offset="8">
    <template #activator="{ props }">
      <button
        v-bind="props"
        type="button"
        class="panel-btn panel-btn--outline panel-btn--sm"
        :aria-label="t('common.language')"
        :title="t('common.language')"
      >
        <v-icon size="14">mdi-translate</v-icon>
        <span>{{ localeStore.locale.toUpperCase() }}</span>
        <v-icon size="12">mdi-chevron-down</v-icon>
      </button>
    </template>
    <v-list density="compact" min-width="140">
      <v-list-item
        v-for="option in languageOptions"
        :key="option.value"
        :title="option.label"
        :active="localeStore.locale === option.value"
        @click="setLocale(option.value)"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SupportedLocale } from '@/plugins/i18n'
import { useLocaleStore } from '@/stores/locale.store'
import { usePlatformSettingsStore } from '@/stores/platformSettings.store'

const { t } = useI18n()
const localeStore = useLocaleStore()
const platformSettings = usePlatformSettingsStore()

const languageOptions = computed<Array<{ value: SupportedLocale; label: string }>>(() => [
  { value: 'en', label: t('common.english') },
  { value: 'da', label: t('common.danish') },
])

async function setLocale(locale: SupportedLocale) {
  if (localeStore.locale === locale) return
  await localeStore.setLocale(locale)
}
</script>
