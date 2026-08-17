<template>
  <div class="panel-page overview-page">
    <PageHeader
      :title="t('admin.views.dealers.title')"
      :subtitle="t('admin.views.dealers.subtitle')"
    />

    <div class="panel-filters-card mb-4">
      <v-text-field
        v-model="search"
        :placeholder="t('common.search')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
        @update:model-value="loadDealers"
      />
    </div>

    <div class="panel-table-card">
      <v-data-table
        :headers="headers"
        :items="dealers"
        :loading="loading"
        item-value="id"
      >
        <template #item.owner="{ item }">
          <div class="dealer-cell">
            <div class="dealer-cell__name">{{ getDealerDisplayName(item, t('admin.views.dealers.unnamedDealer')) }}</div>
            <div v-if="item.email" class="dealer-cell__email">{{ item.email }}</div>
          </div>
        </template>

        <template #item.cvr="{ item }">
          <v-chip v-if="!isValidCvr(item.cvr)" size="small" color="warning" variant="tonal">
            {{ t('admin.views.dealers.pendingCvr') }}
          </v-chip>
          <span v-else>{{ item.cvr }}</span>
        </template>

        <template #item.city="{ item }">
          {{ item.city || '—' }}
        </template>

        <template #item.vehicles_count="{ item }">
          <span>
            {{ t('admin.views.dealers.publishedOfTotal', {
              published: item.publishedVehiclesCount ?? 0,
              total: item.vehiclesCount ?? 0,
            }) }}
          </span>
        </template>

        <template #item.status="{ item }">
          <div class="d-flex flex-column gap-1">
            <v-chip
              size="small"
              :color="getSubscriptionStatusColor(item)"
              variant="tonal"
            >
              {{ getSubscriptionStatusLabel(item) }}
            </v-chip>
            <v-chip
              v-if="item.hasPendingChangeRequest"
              size="x-small"
              color="info"
              variant="outlined"
              prepend-icon="mdi-clock-outline"
            >
              {{ t('admin.views.dealers.pendingChangeRequest') }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1 align-center justify-end">
            <v-tooltip :text="t('common.view')" location="top">
              <template #activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  v-bind="props"
                  @click.stop="openDealer(item.id)"
                >
                  <v-icon size="20">mdi-eye</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <LoginAsDealerButton
              :dealer-id="item.id"
              :dealer-name="getDealerDisplayName(item, t('admin.views.dealers.unnamedDealer'))"
              :has-owner="!!(item.owner?.id || item.userId)"
            />
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-center text-medium-emphasis">
            {{ t('admin.views.dealers.noDealersFound') }}
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDealers } from '@/api/admin.api'
import type { DealerModel } from '@/models/dealer.model'
import { getDealerDisplayName, isValidCvr } from '@/utils/dealerDisplay'
import PageHeader from '@/components/panel/PageHeader.vue'
import LoginAsDealerButton from '@/components/admin/LoginAsDealerButton.vue'

const { t } = useI18n()
const router = useRouter()
const dealers = ref<DealerModel[]>([])
const loading = ref(false)
const search = ref('')

const headers = [
  { title: 'ID', key: 'id', width: '64px' },
  { title: t('admin.views.dealers.dealer'), key: 'owner' },
  { title: t('admin.views.dealers.cvr'), key: 'cvr' },
  { title: t('admin.views.dealers.city'), key: 'city' },
  { title: t('admin.views.dealers.vehicles'), key: 'vehicles_count' },
  { title: t('admin.views.dealers.status'), key: 'status', sortable: false },
  { title: t('common.actions'), key: 'actions', sortable: false, width: '96px', align: 'end' as const },
]

const SUBSCRIPTION_STATUS_META: Record<number, { key: string; color: string }> = {
  1: { key: 'admin.views.subscriptions.trial', color: 'info' },
  2: { key: 'admin.views.subscriptions.active', color: 'success' },
  3: { key: 'admin.views.subscriptions.expired', color: 'error' },
  4: { key: 'admin.views.subscriptions.canceled', color: 'warning' },
  5: { key: 'admin.views.subscriptions.scheduled', color: 'primary' },
}

function getSubscriptionStatusLabel(item: DealerModel): string {
  if (!item.subscriptionStatusId) return t('admin.views.dealers.noSubscription')
  const meta = SUBSCRIPTION_STATUS_META[item.subscriptionStatusId]
  return meta ? t(meta.key) : t('common.unknown')
}

function getSubscriptionStatusColor(item: DealerModel): string {
  if (!item.subscriptionStatusId) return 'grey'
  return SUBSCRIPTION_STATUS_META[item.subscriptionStatusId]?.color || 'grey'
}

async function loadDealers() {
  loading.value = true
  try {
    const res = await getDealers({ search: search.value || undefined, limit: 50 })
    dealers.value = res.docs
  } finally {
    loading.value = false
  }
}

function openDealer(id: number) {
  router.push({ name: 'admin.dealers.detail', params: { id } })
}

onMounted(loadDealers)
</script>

<style scoped>
.dealer-cell__name {
  font-weight: 500;
}

.dealer-cell__email {
  font-size: 0.75rem;
  color: var(--muted-foreground, rgba(0, 0, 0, 0.6));
}
</style>
