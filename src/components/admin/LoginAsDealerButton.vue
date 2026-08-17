<template>
  <span class="login-as-dealer">
    <v-tooltip
      :text="canImpersonate ? t('admin.views.dealers.loginAsDealer') : t('admin.views.dealers.loginAsDealerNoOwner')"
      location="top"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          icon
          variant="text"
          size="small"
          :color="color"
          :disabled="!canImpersonate || loading"
          :loading="loading"
          v-bind="tooltipProps"
          @click.stop="showConfirm = true"
        >
          <v-icon size="20">mdi-login-variant</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-dialog v-model="showConfirm" max-width="480">
      <v-card>
        <v-card-title>{{ t('admin.views.dealers.loginAsDealerConfirmTitle') }}</v-card-title>
        <v-card-text>
          {{ t('admin.views.dealers.loginAsDealerConfirm', { name: dealerName }) }}
        </v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mx-4 mb-2"
        >
          {{ error }}
        </v-alert>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="loading" @click="showConfirm = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn color="primary" :loading="loading" @click="confirm">
            {{ t('admin.views.dealers.loginAsDealer') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerImpersonation } from '@/composables/useDealerImpersonation'
import { getDealerDisplayName } from '@/utils/dealerDisplay'

const props = withDefaults(
  defineProps<{
    dealerId: number
    dealerName?: string
    hasOwner?: boolean
    color?: string
  }>(),
  {
    dealerName: '',
    hasOwner: true,
    color: 'warning',
  },
)

const { t } = useI18n()
const { loginAsDealer } = useDealerImpersonation()

const showConfirm = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const canImpersonate = computed(() => props.hasOwner && props.dealerId > 0)
const dealerName = computed(() =>
  props.dealerName || getDealerDisplayName({ id: props.dealerId, name: '' }, t('admin.views.dealers.unnamedDealer')),
)

async function confirm() {
  if (!canImpersonate.value) return
  loading.value = true
  error.value = null
  try {
    await loginAsDealer(props.dealerId, dealerName.value)
    showConfirm.value = false
  } catch (err: unknown) {
    const message = (err as { message?: string })?.message
    error.value = message || t('admin.views.dealers.loginAsDealerFailed')
  } finally {
    loading.value = false
  }
}
</script>
