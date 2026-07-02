<template>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" size="small" @click="snackbar.show = false">
        {{ t('common.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { SnackbarColor } from '@/composables/useSnackbar'

defineProps<{
  snackbar: {
    show: boolean
    message: string
    color: SnackbarColor
  }
}>()

const { t } = useI18n()
</script>
