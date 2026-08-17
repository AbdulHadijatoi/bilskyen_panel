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
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDealerDetailRaw } from '@/api/admin.api'
import { getDealerDisplayName, isValidCvr } from '@/utils/dealerDisplay'
import PageHeader from '@/components/panel/PageHeader.vue'
import LoginAsDealerButton from '@/components/admin/LoginAsDealerButton.vue'

const { t } = useI18n()
const route = useRoute()
const dealer = ref<any>(null)
const loading = ref(true)

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

onMounted(async () => {
  try {
    dealer.value = await getDealerDetailRaw(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
