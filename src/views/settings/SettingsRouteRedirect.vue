<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsModalStore, type SettingsSection } from '@/stores/settingsModal'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsModalStore()

onMounted(() => {
  const section = (route.meta.openSettings as SettingsSection) || 'profile'
  const fallback = (route.meta.settingsFallback as string) || 'dealer.dashboard'
  settingsStore.open(section)
  router.replace({ name: fallback })
})
</script>

<template>
  <div />
</template>
