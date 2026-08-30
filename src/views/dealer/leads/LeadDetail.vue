<template>
  <div class="panel-page">
    <PageHeader
      :title="t('dealer.views.leadsDetail.title')"
      :subtitle="t('dealer.views.leadsDetail.subtitle')"
      show-back
    />

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal">
        {{ error }}
      </v-alert>
    </div>

    <div v-else-if="lead" class="d-flex flex-column gap-4">
      <v-row>
        <!-- Main Information -->
        <v-col cols="12" md="8">
          <!-- Customer Information -->
          <v-card
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ t('dealer.views.leadsDetail.customerInformation') }}</span>
              <div class="d-flex gap-2">
                <v-btn
                  v-if="lead.email"
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  :href="emailMailtoHref"
                  :title="t('dealer.views.leadsDetail.emailAction')"
                >
                  <v-icon>mdi-email</v-icon>
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.name') }}</div>
                    <div class="font-weight-medium text-h6">{{ lead.name || t('common.na') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.email') }}</div>
                    <div class="font-weight-medium">
                      <a v-if="lead.email" :href="`mailto:${lead.email}`" class="text-primary">
                        {{ lead.email }}
                      </a>
                      <span v-else>{{ t('common.na') }}</span>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.phone') }}</div>
                    <div class="font-weight-medium">
                      <a v-if="lead.phone" :href="`tel:${lead.phone}`" class="text-primary">
                        {{ lead.phone }}
                      </a>
                      <span v-else>{{ t('common.na') }}</span>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.source') }}</div>
                    <div class="font-weight-medium">{{ lead.source || t('common.na') }}</div>
                  </div>
                </v-col>
                <v-col cols="12">
                  <LeadAttributionBlock :lead="lead" />
                </v-col>
                <v-col cols="12" v-if="lead.message || lead.enquiry">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">
                      {{ lead.enquiry ? t('dealer.views.leadsDetail.initialEnquiryOrMessage') : t('dealer.views.leadsDetail.message') }}
                    </div>
                    <v-card variant="tonal" density="compact" class="pa-3 rounded-lg">
                      <div v-if="lead.enquiry" class="d-flex flex-column gap-1">
                        <div v-if="lead.enquiry.type" class="text-body-2">
                          <strong>{{ t('dealer.views.leadsDetail.purposeLabel') }}</strong> {{ lead.enquiry.type }}
                        </div>
                        <div v-if="lead.enquiry.subject" class="text-body-2">
                          <strong>{{ t('dealer.views.leadsDetail.subjectLabel') }}</strong> {{ lead.enquiry.subject }}
                        </div>
                        <div class="text-body-2 mt-1">
                          <strong>{{ t('dealer.views.leadsDetail.messageLabel') }}</strong>
                          <p class="mt-1">{{ lead.enquiry.message }}</p>
                        </div>
                      </div>
                      <div v-else class="text-body-2">
                        {{ lead.message }}
                      </div>
                    </v-card>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Lead Status & Properties -->
          <v-card
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title>{{ t('dealer.views.leadsDetail.leadProperties') }}</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.stage') }}</div>
                    <v-select
                      v-model="selectedStage"
                      :items="stageOptions"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      @update:model-value="updateStage"
                    >
                      <template #selection="{ item }">
                        <v-chip
                          size="small"
                          variant="flat"
                          :color="getStageColor(item.raw.id)"
                        >
                          {{ item.raw.name }}
                        </v-chip>
                      </template>
                    </v-select>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.intent') }}</div>
                    <v-select
                      v-model="selectedIntent"
                      :items="intentOptions"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      @update:model-value="updateIntent"
                    >
                      <template #selection="{ item }">
                        <v-chip
                          size="small"
                          variant="flat"
                          :color="getIntentColor(item.raw.id)"
                        >
                          {{ item.raw.name }}
                        </v-chip>
                      </template>
                    </v-select>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.category') }}</div>
                    <v-select
                      v-model="selectedCategory"
                      :items="categoryOptions"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      @update:model-value="updateCategory"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.created') }}</div>
                    <div class="font-weight-medium">{{ formatLeadDateFull(lead.createdAt) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.lastActivity') }}</div>
                    <div class="font-weight-medium">{{ formatLeadDateFull(lead.lastActivityAt || lead.createdAt) }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Vehicle Information -->
          <v-card
            v-if="lead.vehicle"
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ t('dealer.views.leadsDetail.vehicleInformation') }}</span>
              <v-btn
                v-if="linkedVehicleId"
                variant="text"
                size="small"
                prepend-icon="mdi-open-in-new"
                :to="{ name: 'dealer.vehicles.detail', params: { id: linkedVehicleId } }"
              >
                {{ t('dealer.views.leadsDetail.viewVehicle') }}
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">{{ t('dealer.views.leadsDetail.titleLabel') }}</div>
                    <div class="font-weight-medium">{{ lead.vehicle.title || t('common.na') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">{{ t('dealer.views.leadsDetail.registration') }}</div>
                    <div class="font-weight-medium">{{ lead.vehicle.registration || t('common.na') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6" v-if="lead.vehicle.price">
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">{{ t('dealer.views.leadsDetail.price') }}</div>
                    <div class="font-weight-medium">{{ formatCurrency(lead.vehicle.price, t('common.na')) }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Quick Actions -->
          <v-card
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title>{{ t('dealer.views.leadsDetail.quickActions') }}</v-card-title>
            <v-card-text>
              <div class="d-flex flex-column gap-2">
                <v-btn
                  v-if="lead.email"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-email"
                  block
                  :href="emailMailtoHref"
                >
                  {{ t('dealer.views.leadsDetail.sendEmail') }}
                </v-btn>
                <v-btn
                  v-if="linkedVehicleId"
                  variant="outlined"
                  prepend-icon="mdi-car"
                  block
                  :to="{ name: 'dealer.vehicles.detail', params: { id: linkedVehicleId } }"
                >
                  {{ t('dealer.views.leadsDetail.viewVehicle') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <DealBuilderPanel
            v-if="lead.id"
            :lead-id="lead.id"
            :default-list-price="lead.vehicle?.price"
          />

          <!-- Assigned To -->
          <v-card
            v-if="lead.assignedTo"
            variant="outlined"
            class="mb-4"
            :style="{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title>{{ t('dealer.views.leadsDetail.assignedTo') }}</v-card-title>
            <v-card-text>
              <div class="d-flex align-center gap-2">
                <v-avatar size="40" color="primary">
                  <span class="text-white">{{ lead.assignedTo.name?.charAt(0) || 'U' }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ lead.assignedTo.name || t('common.unknown') }}</div>
                  <div class="text-caption text-medium-emphasis">{{ lead.assignedTo.email || '' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <LeadCrmPanel
        v-if="lead.id"
        :lead-id="lead.id"
        :lead-context="leadAiContext"
      />
    </div>

    <!-- Assign Lead Dialog (hidden until staff module is ready) -->
    <v-dialog v-if="false" v-model="assignDialog" max-width="500">
      <v-card>
        <v-card-title>{{ t('dealer.views.leadsDetail.assignLead') }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStaffId"
            :items="staffMembers"
            item-title="name"
            item-value="id"
            :label="t('dealer.views.leadsDetail.assignToStaff')"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="assignDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" @click="handleAssignLead">{{ t('dealer.views.leadsDetail.assign') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLead, updateLeadStage, updateLeadIntent, updateLeadCategory, assignLead as assignLeadApi, getStaff } from '@/api/dealer.api'
import type { LeadModel } from '@/models/lead.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import LeadCrmPanel from '@/components/crm/LeadCrmPanel.vue'
import LeadAttributionBlock from '@/components/leads/LeadAttributionBlock.vue'
import DealBuilderPanel from '@/components/dealer/leads/DealBuilderPanel.vue'
import {
  getStageColor,
  getIntentName,
  getIntentColor,
  getCategoryName,
  formatLeadDateFull,
  getStageOptions,
  getIntentOptions,
  getCategoryOptions,
} from '@/utils/leadHelpers'
import { formatCurrency } from '@/utils/formatCurrency'
import { useLeadStagesStore } from '@/stores/leadStages.store'
import PageHeader from '@/components/panel/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const leadStagesStore = useLeadStagesStore()

const loading = ref(false)
const error = ref<string | null>(null)
const lead = ref<LeadModel | null>(null)
const updating = ref(false)
const assignDialog = ref(false)
const selectedStaffId = ref<number | null>(null)
const staffMembers = ref<any[]>([])

const selectedStage = ref<number | null>(null)
const selectedIntent = ref<number | null>(null)
const selectedCategory = ref<number | null>(null)

const stageOptions = computed(() => getStageOptions())
const intentOptions = getIntentOptions()
const categoryOptions = getCategoryOptions()

const linkedVehicleId = computed(() => lead.value?.vehicleId ?? lead.value?.vehicle?.id ?? null)

const leadAiContext = computed(() => {
  if (!lead.value) return undefined
  return {
    name: lead.value.name,
    email: lead.value.email,
    phone: lead.value.phone,
    stage: lead.value.stage != null ? String(lead.value.stage) : lead.value.stageId,
    intent: lead.value.intent,
    category: lead.value.category,
    source: lead.value.source,
    vehicle: lead.value.vehicle?.title,
    message: lead.value.message,
  }
})

const emailMailtoHref = computed(() => {
  if (!lead.value?.email) return ''
  const subject = lead.value.enquiry?.subject
  if (subject) {
    return `mailto:${lead.value.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`
  }
  return `mailto:${lead.value.email}`
})

// Watch lead changes and update selected values
watch(lead, (newLead) => {
  if (newLead) {
    selectedStage.value = newLead.stageId
    selectedIntent.value = newLead.intentId || null
    selectedCategory.value = newLead.categoryId || null
  }
}, { immediate: true })

const updateStage = async () => {
  if (!lead.value || !selectedStage.value) return

  try {
    updating.value = true
    await updateLeadStage(lead.value.id, { stage_id: selectedStage.value })
    await loadLead()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.leadsDetail.failedUpdateStage')
  } finally {
    updating.value = false
  }
}

const updateIntent = async () => {
  if (!lead.value || !selectedIntent.value) return

  try {
    updating.value = true
    await updateLeadIntent(lead.value.id, { intent_id: selectedIntent.value })
    await loadLead()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.leadsDetail.failedUpdateIntent')
  } finally {
    updating.value = false
  }
}

const updateCategory = async () => {
  if (!lead.value || !selectedCategory.value) return

  try {
    updating.value = true
    await updateLeadCategory(lead.value.id, { category_id: selectedCategory.value })
    await loadLead()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.leadsDetail.failedUpdateCategory')
  } finally {
    updating.value = false
  }
}

const assignLead = () => {
  assignDialog.value = true
}

const handleAssignLead = async () => {
  if (!lead.value || !selectedStaffId.value) return

  try {
    updating.value = true
    await assignLeadApi(lead.value.id, { assigned_to_id: selectedStaffId.value })
    await loadLead()
    assignDialog.value = false
    selectedStaffId.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.leadsDetail.failedAssignLead')
  } finally {
    updating.value = false
  }
}

const loadLead = async () => {
  const leadId = route.params.id as string
  if (!leadId) return

  try {
    loading.value = true
    error.value = null
    const loadedLead = await getLead(leadId)
    lead.value = loadedLead
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.leadsDetail.failedLoadLead')
  } finally {
    loading.value = false
  }
}

const loadStaff = async () => {
  try {
    const staff = await getStaff()
    staffMembers.value = staff.map((s: any) => ({
      id: s.user_id || s.user?.id,
      name: s.user?.name || t('common.unknown'),
    }))
  } catch (err) {
    console.error('Failed to load staff:', err)
  }
}


onMounted(async () => {
  await Promise.all([leadStagesStore.fetchStages(), loadLead(), loadStaff()])
})

// Watch route params to reload data when navigating to a different lead
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadLead()
  }
})
</script>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>