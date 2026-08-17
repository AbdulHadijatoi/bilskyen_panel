<template>
  <div v-if="authStore.isImpersonating" class="impersonation-banner" role="status">
    <v-icon size="18">mdi-account-switch</v-icon>
    <span class="impersonation-banner__text">
      {{ t('admin.views.dealers.viewingAsDealer', { name: dealerName }) }}
    </span>
    <v-btn
      size="small"
      variant="flat"
      color="surface"
      :loading="returning"
      @click="handleReturn"
    >
      {{ t('admin.views.dealers.returnToAdmin') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useDealerImpersonation } from '@/composables/useDealerImpersonation'

const { t } = useI18n()
const authStore = useAuthStore()
const { returnToAdmin } = useDealerImpersonation()
const returning = ref(false)

const dealerName = computed(
  () => authStore.impersonation?.dealerName || authStore.user?.name || t('admin.views.dealers.unnamedDealer'),
)

async function handleReturn() {
  returning.value = true
  try {
    await returnToAdmin()
  } finally {
    returning.value = false
  }
}
</script>

<style scoped>
.impersonation-banner {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: 10px 16px;
  background: #b45309;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 20;
}

.impersonation-banner__text {
  flex: 1;
}
</style>
