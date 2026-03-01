<template>
  <div>
    <h1 class="text-xl font-weight-bold mb-0" style="line-height: 1.5;">{{ t('dealer.dashboardHeader.homeOfDealer') }}</h1>
    <p class="text-lg mb-0" style="line-height: 1.5;">
      {{ greeting }}
      <span class="font-weight-semibold">{{ authStore.user?.name || t('dealer.dashboardHeader.dealerFallback') }}</span>!
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
const authStore = useAuthStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return t('dealer.dashboardHeader.goodMorning')
  if (hour < 18) return t('dealer.dashboardHeader.goodAfternoon')
  return t('dealer.dashboardHeader.goodEvening')
})
</script>

