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
              <v-switch
                v-model="showListingBadge"
                :label="t('admin.views.dealers.showListingBadge')"
                color="primary"
                hide-details
                class="mb-2"
                :disabled="savingBadgeSettings"
              />
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ t('admin.views.dealers.showListingBadgeHint') }}
              </p>
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
                :disabled="savingBadgeSettings || !showListingBadge"
              />
              <div class="d-flex flex-wrap gap-2 mt-4">
                <v-btn
                  color="primary"
                  :loading="savingBadgeSettings"
                  :disabled="!badgeSettingsDirty"
                  @click="saveListingBadgeSettings"
                >
                  {{ t('admin.views.dealers.saveListingBadgeLabel') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  :disabled="savingBadgeSettings || !dealer.listing_badge_label"
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
const showListingBadge = ref(true)
const savingBadgeSettings = ref(false)
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

const badgeSettingsDirty = computed(() => {
  const currentLabel = (dealer.value?.listing_badge_label ?? '').trim()
  const currentShow = dealer.value?.show_listing_badge !== false
  return listingBadgeLabel.value.trim() !== currentLabel || showListingBadge.value !== currentShow
})

watch(dealer, (value) => {
  listingBadgeLabel.value = value?.listing_badge_label ?? ''
  showListingBadge.value = value?.show_listing_badge !== false
}, { immediate: true })

async function saveListingBadgeSettings() {
  if (!dealer.value) return

  savingBadgeSettings.value = true
  try {
    await updateDealer(dealer.value.id, {
      listing_badge_label: listingBadgeLabel.value.trim() || null,
      show_listing_badge: showListingBadge.value,
    })
    dealer.value = await getDealerDetailRaw(dealer.value.id)
    successMessage.value = t('admin.views.dealers.listingBadgeSettingsSaved')
    showSuccess.value = true
  } catch (err) {
    errorMessage.value = (err as ApiErrorModel).message || t('admin.views.dealers.listingBadgeSettingsSaveFailed')
    showError.value = true
  } finally {
    savingBadgeSettings.value = false
  }
}

async function clearListingBadgeLabel() {
  listingBadgeLabel.value = ''
  await saveListingBadgeSettings()
}

onMounted(async () => {
  try {
    dealer.value = await getDealerDetailRaw(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
