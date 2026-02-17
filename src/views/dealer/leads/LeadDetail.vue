<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          class="mb-2"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h5 font-weight-bold mb-1">{{ t('dealer.views.leadsDetail.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis">
          {{ t('dealer.views.leadsDetail.subtitle') }}
        </p>
      </div>
    </div>

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
                  v-if="lead.phone"
                  icon
                  variant="text"
                  size="small"
                  color="success"
                  :href="`tel:${lead.phone}`"
                  :title="t('dealer.views.leadsDetail.call')"
                >
                  <v-icon>mdi-phone</v-icon>
                </v-btn>
                <v-btn
                  v-if="lead.email"
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  :href="`mailto:${lead.email}`"
                  :title="t('dealer.views.leadsDetail.emailAction')"
                >
                  <v-icon>mdi-email</v-icon>
                </v-btn>
                <v-btn
                  v-if="lead.phone"
                  icon
                  variant="text"
                  size="small"
                  color="success"
                  :href="`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`"
                  target="_blank"
                  :title="t('dealer.views.leadsDetail.whatsApp')"
                >
                  <v-icon>mdi-whatsapp</v-icon>
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.name') }}</div>
                    <div class="font-weight-medium text-h6">{{ lead.name || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.email') }}</div>
                    <div class="font-weight-medium">
                      <a v-if="lead.email" :href="`mailto:${lead.email}`" class="text-primary">
                        {{ lead.email }}
                      </a>
                      <span v-else>N/A</span>
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
                      <span v-else>N/A</span>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('dealer.views.leadsDetail.source') }}</div>
                    <div class="font-weight-medium">{{ lead.source || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" v-if="lead.message">
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">Message/Enquiry</div>
                    <div class="text-body-2">{{ lead.message }}</div>
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
                v-if="lead.vehicleId"
                variant="text"
                size="small"
                prepend-icon="mdi-open-in-new"
                @click="viewVehicle(lead.vehicleId)"
              >
                {{ t('dealer.views.leadsDetail.viewVehicle') }}
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">{{ t('dealer.views.leadsDetail.titleLabel') }}</div>
                    <div class="font-weight-medium">{{ lead.vehicle.title || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">{{ t('dealer.views.leadsDetail.registration') }}</div>
                    <div class="font-weight-medium">{{ lead.vehicle.registration || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6" v-if="lead.vehicle.price">
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">{{ t('dealer.views.leadsDetail.price') }}</div>
                    <div class="font-weight-medium">{{ formatPrice(lead.vehicle.price) }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Messages -->
          <v-card
            variant="outlined"
            :style="{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-title>{{ t('dealer.views.leadsDetail.messages') }}</v-card-title>
            <v-card-text>
              <div v-if="messages.length === 0" class="text-center text-medium-emphasis py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-message-outline</v-icon>
                <div class="mt-2">{{ t('dealer.views.leadsDetail.noMessagesYet') }}</div>
              </div>
              <div v-else class="d-flex flex-column gap-2 mb-4" style="max-height: 400px; overflow-y: auto;">
                <v-card
                  v-for="message in messages"
                  :key="message.id"
                  variant="outlined"
                  :style="{
                    backgroundColor: message.isFromCustomer ? 'var(--muted)' : 'var(--card)',
                    borderColor: 'var(--border)',
                  }"
                >
                  <v-card-text>
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div>
                        <div class="font-weight-medium">
                          {{ message.user?.name || 'Unknown' }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatLeadDateFull(message.createdAt) }}
                        </div>
                      </div>
                    </div>
                    <div class="text-body-2">{{ message.message }}</div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Send Message -->
              <v-textarea
                v-model="newMessage"
                :label="t('dealer.views.leadsDetail.sendMessage')"
                variant="outlined"
                rows="3"
                class="mb-2"
                :placeholder="t('dealer.views.leadsDetail.messagePlaceholder')"
              />
              <v-btn
                color="primary"
                prepend-icon="mdi-send"
                @click="sendMessage"
                :loading="sending"
                :disabled="!newMessage.trim()"
              >
                Send Message
              </v-btn>
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
                  v-if="lead.phone"
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-phone"
                  block
                  :href="`tel:${lead.phone}`"
                >
                  Call Customer
                </v-btn>
                <v-btn
                  v-if="lead.email"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-email"
                  block
                  :href="`mailto:${lead.email}`"
                >
                  Send Email
                </v-btn>
                <v-btn
                  v-if="lead.phone"
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-whatsapp"
                  block
                  :href="`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`"
                  target="_blank"
                >
                  WhatsApp
                </v-btn>
                <v-btn
                  v-if="lead.vehicleId"
                  variant="outlined"
                  prepend-icon="mdi-car"
                  block
                  @click="viewVehicle(lead.vehicleId)"
                >
                  View Vehicle
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-account-plus"
                  block
                  @click="assignLead"
                >
                  Assign to Staff
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

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
                  <div class="font-weight-medium">{{ lead.assignedTo.name || 'Unknown' }}</div>
                  <div class="text-caption text-medium-emphasis">{{ lead.assignedTo.email || '' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Assign Lead Dialog -->
    <v-dialog v-model="assignDialog" max-width="500">
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLead, updateLeadStage, updateLeadIntent, updateLeadCategory, getLeadMessages, sendLeadMessage, assignLead as assignLeadApi, getStaff } from '@/api/dealer.api'
import type { LeadModel, LeadMessageModel } from '@/models/lead.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import {
  getStageName,
  getStageColor,
  getIntentName,
  getIntentColor,
  getCategoryName,
  formatLeadDateFull,
  getStageOptions,
  getIntentOptions,
  getCategoryOptions,
} from '@/utils/leadHelpers'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const lead = ref<LeadModel | null>(null)
const messages = ref<LeadMessageModel[]>([])
const sending = ref(false)
const updating = ref(false)
const newMessage = ref('')
const assignDialog = ref(false)
const selectedStaffId = ref<number | null>(null)
const staffMembers = ref<any[]>([])

const selectedStage = ref<number | null>(null)
const selectedIntent = ref<number | null>(null)
const selectedCategory = ref<number | null>(null)

const stageOptions = getStageOptions()
const intentOptions = getIntentOptions()
const categoryOptions = getCategoryOptions()

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

const sendMessage = async () => {
  if (!lead.value || !newMessage.value.trim()) return

  try {
    sending.value = true
    await sendLeadMessage(lead.value.id, { message: newMessage.value })
    newMessage.value = ''
    await loadMessages()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.leadsDetail.failedSendMessage')
  } finally {
    sending.value = false
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

const viewVehicle = (vehicleId: number) => {
  router.push({ name: 'dealer.vehicles.detail', params: { id: vehicleId } })
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

const loadMessages = async () => {
  const leadId = route.params.id as string
  if (!leadId) return

  try {
    const loadedMessages = await getLeadMessages(leadId)
    
    // Ensure loadedMessages is an array
    let messagesArray: any[] = []
    if (Array.isArray(loadedMessages)) {
      messagesArray = loadedMessages
    } else if (loadedMessages && typeof loadedMessages === 'object') {
      // Handle case where response is wrapped in { data: [...] } or { messages: [...] }
      const responseObj = loadedMessages as Record<string, any>
      if ('data' in responseObj && Array.isArray(responseObj.data)) {
        messagesArray = responseObj.data
      } else if ('messages' in responseObj && Array.isArray(responseObj.messages)) {
        messagesArray = responseObj.messages
      }
    }
    
    messages.value = messagesArray.map((msg: any) => ({
      id: msg.id,
      leadId: msg.lead_id,
      userId: msg.user_id,
      message: msg.message,
      isFromCustomer: msg.is_from_customer ?? false,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
      // Ensure user object is properly mapped, preserving all user data
      user: msg.user ? {
        id: msg.user.id,
        name: msg.user.name,
        email: msg.user.email,
        phone: msg.user.phone,
        ...msg.user, // Include any other user fields
      } : null,
    }))
  } catch (err) {
    console.error('Failed to load messages:', err)
    messages.value = [] // Set to empty array on error
  }
}

const loadStaff = async () => {
  try {
    const staff = await getStaff()
    staffMembers.value = staff.map((s: any) => ({
      id: s.user_id || s.user?.id,
      name: s.user?.name || 'Unknown',
    }))
  } catch (err) {
    console.error('Failed to load staff:', err)
  }
}

const formatPrice = (price?: number) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

onMounted(async () => {
  await Promise.all([loadLead(), loadMessages(), loadStaff()])
})

// Watch route params to reload data when navigating to a different lead
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await Promise.all([loadLead(), loadMessages()])
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