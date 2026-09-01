<template>
  <div class="panel-page">
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="dealer">
      <PageHeader
        :title="displayName"
        :subtitle="`${cvrLabel} · ${dealer.city || '—'}`"
        show-back
        :back-to="{ name: 'admin.dealers' }"
      >
        <template #actions>
          <v-chip v-if="!isValidCvr(dealer.cvr)" size="small" color="warning" variant="tonal">
            {{ t('admin.views.dealers.pendingCvr') }}
          </v-chip>
          <v-chip v-if="pendingChangeRequest" size="small" color="info" variant="tonal" class="ml-2">
            {{ t('admin.views.dealers.pendingChangeRequest') }}
          </v-chip>
          <LoginAsDealerButton
            class="ml-2"
            :dealer-id="dealer.id"
            :dealer-name="displayName"
            :has-owner="!!(dealer.owner?.id || dealer.user_id)"
          />
        </template>
      </PageHeader>

      <v-row>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.vehicles') }}</v-card-title>
            <v-card-text class="text-h5">
              {{ t('admin.views.dealers.publishedOfTotal', {
                published: dealer.published_vehicles_count ?? 0,
                total: dealer.vehicles?.length ?? 0,
              }) }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.staff') }}</v-card-title>
            <v-card-text class="text-h5">{{ dealer.staff?.length ?? 0 }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.subscriptions') }}</v-card-title>
            <v-card-text class="text-h5">{{ dealer.subscriptions?.length ?? 0 }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" md="8" lg="6">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.listingBadgeLabel') }}</v-card-title>
            <v-card-text>
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ t('admin.views.dealers.listingBadgeLabelHint') }}
              </p>
              <v-text-field
                v-model="listingBadgeLabel"
                :label="t('admin.views.dealers.listingBadgeLabel')"
                :placeholder="t('admin.views.dealers.listingBadgeLabelPlaceholder')"
                :counter="20"
                maxlength="20"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :disabled="savingBadgeLabel"
              />
              <div class="d-flex flex-wrap gap-2 mt-4">
                <v-btn
                  color="primary"
                  :loading="savingBadgeLabel"
                  :disabled="!badgeLabelDirty"
                  @click="saveListingBadgeLabel"
                >
                  {{ t('admin.views.dealers.saveListingBadgeLabel') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  :disabled="savingBadgeLabel || !dealer.listing_badge_label"
                  @click="clearListingBadgeLabel"
                >
                  {{ t('admin.views.dealers.clearListingBadgeLabel') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      {{ successMessage }}
    </v-snackbar>
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDealerDetailRaw, updateDealer } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import { getDealerDisplayName, isValidCvr } from '@/utils/dealerDisplay'
import PageHeader from '@/components/panel/PageHeader.vue'
import LoginAsDealerButton from '@/components/admin/LoginAsDealerButton.vue'

const { t } = useI18n()
const route = useRoute()
const dealer = ref<any>(null)
const loading = ref(true)
const listingBadgeLabel = ref('')
const savingBadgeLabel = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const displayName = computed(() =>
  getDealerDisplayName(
    {
      id: dealer.value?.id ?? 0,
      name: dealer.value?.owner?.name ?? dealer.value?.slug,
      email: dealer.value?.owner?.email,
    },
    t('admin.views.dealers.unnamedDealer'),
  ),
)

const cvrLabel = computed(() =>
  isValidCvr(dealer.value?.cvr)
    ? dealer.value.cvr
    : t('admin.views.dealers.pendingCvr'),
)

const pendingChangeRequest = computed(
  () => (dealer.value?.subscription_change_requests?.length ?? 0) > 0,
)

const badgeLabelDirty = computed(() => {
  const current = (dealer.value?.listing_badge_label ?? '').trim()
  return listingBadgeLabel.value.trim() !== current
})

watch(dealer, (value) => {
  listingBadgeLabel.value = value?.listing_badge_label ?? ''
}, { immediate: true })

async function saveListingBadgeLabel() {
  if (!dealer.value) return

  savingBadgeLabel.value = true
  const wasClearing = listingBadgeLabel.value.trim() === ''
  try {
    await updateDealer(dealer.value.id, {
      listing_badge_label: listingBadgeLabel.value.trim() || null,
    })
    dealer.value = await getDealerDetailRaw(dealer.value.id)
    successMessage.value = wasClearing
      ? t('admin.views.dealers.listingBadgeLabelCleared')
      : t('admin.views.dealers.listingBadgeLabelSaved')
    showSuccess.value = true
  } catch (err) {
    errorMessage.value = (err as ApiErrorModel).message || t('admin.views.dealers.listingBadgeLabelSaveFailed')
    showError.value = true
  } finally {
    savingBadgeLabel.value = false
  }
}

async function clearListingBadgeLabel() {
  listingBadgeLabel.value = ''
  await saveListingBadgeLabel()
}

onMounted(async () => {
  try {
    dealer.value = await getDealerDetailRaw(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
