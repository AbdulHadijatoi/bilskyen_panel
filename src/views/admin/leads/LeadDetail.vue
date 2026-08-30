<template>
  <div class="panel-page">
    <PageHeader
      :title="t('admin.views.leadsDetail.title')"
      :subtitle="t('admin.views.leadsDetail.subtitle')"
      show-back
    />

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal">{{ error }}</v-alert>
    </div>

    <div v-else-if="lead" class="d-flex flex-column ga-4">
      <v-row>
        <v-col cols="12" md="8">
          <v-card variant="outlined" class="mb-4">
            <v-card-title>{{ t('admin.views.leadsDetail.buyerInformation') }}</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.name') }}</div>
                  <div class="font-weight-medium">{{ lead.name || t('common.na') }}</div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.email') }}</div>
                  <div class="font-weight-medium">
                    <a v-if="lead.email" :href="`mailto:${lead.email}`" class="text-primary">{{ lead.email }}</a>
                    <span v-else>{{ t('common.na') }}</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.phone') }}</div>
                  <div class="font-weight-medium">
                    <a v-if="lead.phone" :href="`tel:${lead.phone}`" class="text-primary">{{ lead.phone }}</a>
                    <span v-else>{{ t('common.na') }}</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.source') }}</div>
                  <div class="font-weight-medium">{{ getSourceName(lead.source) }}</div>
                </v-col>
                <v-col cols="12">
                  <LeadAttributionBlock :lead="lead" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card v-if="lead.message" variant="outlined" class="mb-4">
            <v-card-title>{{ t('admin.views.leadsDetail.message') }}</v-card-title>
            <v-card-text>
              <p class="text-body-2 whitespace-pre-wrap mb-0">{{ lead.message }}</p>
            </v-card-text>
          </v-card>

          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.leadsDetail.vehicle') }}</v-card-title>
            <v-card-text>
              <div v-if="lead.vehicle">
                <div class="font-weight-medium mb-1">{{ lead.vehicle.title || t('common.na') }}</div>
                <div class="text-body-2 text-medium-emphasis mb-3">
                  {{ lead.vehicle.registration || t('common.noRegistration') }}
                </div>
                <v-btn
                  v-if="lead.vehicleId"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-car"
                  @click="router.push({ name: 'admin.vehicles.detail', params: { id: lead.vehicleId } })"
                >
                  {{ t('admin.views.leadsDetail.viewVehicle') }}
                </v-btn>
              </div>
              <div v-else class="text-medium-emphasis">{{ t('common.na') }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="outlined" class="mb-4">
            <v-card-title>{{ t('admin.views.leadsDetail.status') }}</v-card-title>
            <v-card-text>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.stage') }}</div>
                <v-chip :color="getStageColor(lead.stageId)" size="small" variant="tonal">
                  {{ getStageName(lead.stageId) }}
                </v-chip>
              </div>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.category') }}</div>
                <div class="font-weight-medium">{{ getCategoryName(lead.categoryId) }}</div>
              </div>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.intent') }}</div>
                <v-chip
                  v-if="lead.intentId"
                  :color="getIntentColor(lead.intentId)"
                  size="small"
                  variant="tonal"
                >
                  {{ getIntentName(lead.intentId) }}
                </v-chip>
                <span v-else>{{ t('common.notSet') }}</span>
              </div>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.created') }}</div>
                <div class="font-weight-medium">{{ formatLeadDateFull(lead.createdAt) }}</div>
              </div>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.lastActivity') }}</div>
                <div class="font-weight-medium">{{ formatLeadDateFull(lead.lastActivityAt) }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">{{ t('admin.views.leadsDetail.firstContacted') }}</div>
                <v-chip
                  v-if="lead.firstContactedAt"
                  size="small"
                  color="success"
                  variant="tonal"
                >
                  {{ formatLeadDateFull(lead.firstContactedAt) }}
                </v-chip>
                <v-chip v-else size="small" color="warning" variant="tonal">
                  {{ t('admin.views.leads.notContacted') }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.leadsDetail.dealer') }}</v-card-title>
            <v-card-text>
              <div v-if="lead.dealer">
                <div class="font-weight-medium mb-1">
                  {{ getDealerDisplayName(
                    {
                      id: lead.dealer.id,
                      name: lead.dealer.name || lead.dealer.owner?.name,
                      email: lead.dealer.email || lead.dealer.owner?.email,
                    },
                    t('admin.views.dealers.unnamedDealer'),
                  ) }}
                </div>
                <div class="text-body-2 text-medium-emphasis mb-1">
                  {{ lead.dealer.city || '' }}
                </div>
                <div class="text-body-2 text-medium-emphasis mb-3">
                  {{ lead.dealer.owner?.email || lead.dealer.email || '' }}
                </div>
                <v-btn
                  v-if="lead.dealerId"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-store"
                  @click="router.push({ name: 'admin.dealers.detail', params: { id: lead.dealerId } })"
                >
                  {{ t('admin.views.leadsDetail.viewDealer') }}
                </v-btn>
              </div>
              <div v-else class="text-medium-emphasis">{{ t('common.na') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLead } from '@/api/admin.api'
import type { LeadModel } from '@/models/lead.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import LeadAttributionBlock from '@/components/leads/LeadAttributionBlock.vue'
import { getDealerDisplayName } from '@/utils/dealerDisplay'
import {
  getStageName,
  getStageColor,
  getCategoryName,
  getIntentName,
  getIntentColor,
  getSourceName,
  formatLeadDateFull,
} from '@/utils/leadHelpers'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const lead = ref<LeadModel | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    lead.value = await getLead(String(route.params.id))
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.leadsDetail.failedLoad')
  } finally {
    loading.value = false
  }
})
</script>
