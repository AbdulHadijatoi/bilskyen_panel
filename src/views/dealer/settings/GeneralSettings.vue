<template>
  <div class="flex w-full flex-col gap-4">
    <div>
      <h2 class="text-xl font-bold">{{ t('dealer.views.generalSettings.title') }}</h2>
      <p class="text-muted-foreground max-w-2xl">Configure general application settings.</p>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">{{ t('dealer.views.generalSettings.placeholder') }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
