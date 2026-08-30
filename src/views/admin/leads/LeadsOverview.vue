<template>
  <div class="panel-page overview-page">
    <PageHeader
      :title="t('admin.views.leads.title')"
      :subtitle="t('admin.views.leads.subtitle')"
    />

    <v-row class="mb-5">
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard
          :label="t('admin.views.leads.totalLeads')"
          :value="leads.totalDocs || 0"
          icon="mdi-phone-in-talk"
          color="primary"
        />
      </v-col>
    </v-row>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="search"
            :placeholder="t('admin.views.leads.searchPlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.leads.filterByDealer') }}</span>
          <v-select
            v-model="dealerFilter"
            :items="dealerOptions"
            item-title="title"
            item-value="value"
            :placeholder="t('admin.views.leads.allDealers')"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-store-outline"
            hide-details
            clearable
            :loading="dealersLoading"
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.leads.filterByStage') }}</span>
          <v-select
            v-model="stageFilter"
            :items="stageOptions"
            item-title="name"
            item-value="id"
            :placeholder="t('admin.views.leads.allStages')"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-filter-variant"
            hide-details
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('common.leadAttribution.filterTrafficChannel') }}</span>
          <v-select
            v-model="trafficChannelFilter"
            :items="trafficChannelOptions"
            item-title="label"
            item-value="value"
            :placeholder="t('common.leadAttribution.filterAllChannels')"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-bullhorn-outline"
            hide-details
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="panel-filters-grid__actions">
          <button
            type="button"
            class="panel-btn panel-btn--outline"
            :disabled="loading"
            @click="loadLeads"
          >
            <v-icon size="16">mdi-refresh</v-icon>
            {{ t('common.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <div class="panel-table-card">
      <div class="panel-table-card__body">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('admin.views.leads.loading') }}</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>{{ t('admin.views.users.error') }}</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="leads.docs"
          :items-per-page="leads.limit"
          :items-length="leads.totalDocs || 0"
          :page="currentPage"
          density="comfortable"
          class="panel-data-table"
          elevation="0"
          @update:page="handlePageChange"
          @click:row="(_e: Event, row: { item: LeadModel }) => viewLead(row.item.id)"
        >
          <template #item.id="{ item }">
            <span class="panel-id-cell">#{{ item.id }}</span>
          </template>

          <template #item.buyer="{ item }">
            <div class="min-w-0">
              <div class="panel-vehicle-cell__title text-truncate">{{ item.name || t('common.na') }}</div>
              <div class="panel-vehicle-cell__subtitle text-truncate">
                {{ item.email || item.phone || t('common.na') }}
              </div>
            </div>
          </template>

          <template #item.dealer="{ item }">
            <div v-if="item.dealer" class="min-w-0">
              <div class="panel-vehicle-cell__title text-truncate">
                {{ getDealerDisplayName(
                  {
                    id: item.dealer.id,
                    name: item.dealer.name || item.dealer.owner?.name,
                    email: item.dealer.email || item.dealer.owner?.email,
                  },
                  t('admin.views.dealers.unnamedDealer'),
                ) }}
              </div>
              <div class="panel-vehicle-cell__subtitle text-truncate">
                {{ item.dealer.city || item.dealer.cvr || '' }}
              </div>
            </div>
            <span v-else class="text-medium-emphasis">{{ t('common.na') }}</span>
          </template>

          <template #item.vehicle="{ item }">
            <div v-if="item.vehicle" class="min-w-0">
              <div class="panel-vehicle-cell__title text-truncate">{{ item.vehicle.title || t('common.na') }}</div>
              <div class="panel-vehicle-cell__subtitle text-truncate">
                {{ item.vehicle.registration || '' }}
              </div>
            </div>
            <span v-else class="text-medium-emphasis">{{ t('common.na') }}</span>
          </template>

          <template #item.stage="{ item }">
            <v-chip
              :color="getStageColor(item.stageId)"
              size="small"
              variant="tonal"
            >
              {{ getStageName(item.stageId) }}
            </v-chip>
          </template>

          <template #item.category="{ item }">
            <span class="text-body-2">{{ getCategoryName(item.categoryId) }}</span>
          </template>

          <template #item.trafficChannel="{ item }">
            <div>
              <v-chip
                size="small"
                variant="flat"
                :color="getLeadTrafficChannelColor(item)"
              >
                {{ getLeadTrafficChannelLabel(item) }}
              </v-chip>
              <div v-if="item.utmCampaign" class="text-caption text-medium-emphasis text-truncate mt-1">
                {{ item.utmCampaign }}
              </div>
            </div>
          </template>

          <template #item.createdAt="{ item }">
            <span class="text-body-2">{{ formatLeadDateFull(item.createdAt) }}</span>
          </template>

          <template #item.contacted="{ item }">
            <v-chip
              v-if="item.firstContactedAt"
              size="small"
              color="success"
              variant="tonal"
            >
              {{ formatLeadDate(item.firstContactedAt) }}
            </v-chip>
            <v-chip v-else size="small" color="warning" variant="tonal">
              {{ t('admin.views.leads.notContacted') }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end">
              <v-btn
                icon
                variant="text"
                size="small"
                :title="t('common.view')"
                @click.stop="viewLead(item.id)"
              >
                <v-icon size="18">mdi-eye</v-icon>
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8 text-medium-emphasis">
              {{ t('admin.views.leads.noLeadsFound') }}
            </div>
          </template>
        </v-data-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLeads, getDealersMinimal, getAdminLeadStages, type DealerMinimalItem } from '@/api/admin.api'
import type { LeadModel } from '@/models/lead.model'
import type { PaginationModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import OverviewStatCard from '@/components/panel/OverviewStatCard.vue'
import { getDealerDisplayName } from '@/utils/dealerDisplay'
import {
  getStageName,
  getStageColor,
  getCategoryName,
  formatLeadDate,
  formatLeadDateFull,
  LEAD_STAGE_COLORS,
  getLeadTrafficChannelColor,
  getLeadTrafficChannelLabel,
  TRAFFIC_SOURCE_META,
  TRAFFIC_SOURCE_OTHER,
} from '@/utils/leadHelpers'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const dealersLoading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const dealerFilter = ref<number | null>(null)
const stageFilter = ref<number | null>(null)
const trafficChannelFilter = ref<string | null>(null)
const currentPage = ref(1)
const dealers = ref<DealerMinimalItem[]>([])
const stages = ref<Array<{ id: number; name: string }>>([])
const leads = ref<PaginationModel<LeadModel>>({
  docs: [],
  limit: 15,
  page: 1,
  totalDocs: 0,
  totalPages: 0,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const dealerOptions = computed(() =>
  dealers.value.map((d) => ({
    title: d.name || d.email || `#${d.id}`,
    value: d.id,
  }))
)

const stageOptions = computed(() => {
  if (stages.value.length > 0) {
    return stages.value
  }
  return Object.keys(LEAD_STAGE_COLORS).map((id) => ({
    id: Number(id),
    name: getStageName(Number(id)),
  }))
})

const trafficChannelOptions = computed(() => [
  { label: t('common.leadAttribution.channelMeta'), value: TRAFFIC_SOURCE_META },
  { label: t('common.leadAttribution.channelWeb'), value: TRAFFIC_SOURCE_OTHER },
])

const headers = computed(() => [
  { title: t('admin.views.leads.colId'), key: 'id', width: '72px', sortable: false },
  { title: t('admin.views.leads.colBuyer'), key: 'buyer', sortable: false },
  { title: t('admin.views.leads.colDealer'), key: 'dealer', sortable: false },
  { title: t('admin.views.leads.colVehicle'), key: 'vehicle', sortable: false },
  { title: t('admin.views.leads.colStage'), key: 'stage', width: '130px', sortable: false },
  { title: t('admin.views.leads.colCategory'), key: 'category', width: '140px', sortable: false },
  { title: t('admin.views.leads.colChannel'), key: 'trafficChannel', width: '140px', sortable: false },
  { title: t('admin.views.leads.colCreated'), key: 'createdAt', width: '140px', sortable: false },
  { title: t('admin.views.leads.colContacted'), key: 'contacted', width: '130px', sortable: false },
  { title: t('admin.views.leads.colActions'), key: 'actions', width: '72px', sortable: false, align: 'end' as const },
])

const loadDealers = async () => {
  try {
    dealersLoading.value = true
    dealers.value = await getDealersMinimal()
  } catch {
    dealers.value = []
  } finally {
    dealersLoading.value = false
  }
}

const loadStages = async () => {
  try {
    stages.value = await getAdminLeadStages()
  } catch {
    stages.value = []
  }
}

const loadLeads = async () => {
  try {
    loading.value = true
    error.value = null
    const params: Record<string, string | number> = {
      page: currentPage.value,
      limit: 15,
    }
    if (search.value.trim()) {
      params.search = search.value.trim()
    }
    if (dealerFilter.value != null) {
      params.dealer_id = dealerFilter.value
    }
    if (stageFilter.value != null) {
      params.stage_id = stageFilter.value
    }
    if (trafficChannelFilter.value) {
      params.traffic_source = trafficChannelFilter.value
    }
    leads.value = await getLeads(params)
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.leads.failedLoad')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadLeads()
  }, 350)
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadLeads()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadLeads()
}

const viewLead = (id: number) => {
  router.push({ name: 'admin.leads.detail', params: { id } })
}

onMounted(async () => {
  await Promise.all([
    loadStages(),
    loadDealers(),
    loadLeads(),
  ])
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

:deep(.panel-data-table tbody tr) {
  cursor: pointer;
}
</style>
