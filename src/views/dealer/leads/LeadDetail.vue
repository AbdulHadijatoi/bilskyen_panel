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
        <h2 class="text-h5 font-weight-bold mb-1">Lead Details</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage lead information, messages, and status.
        </p>
      </div>
      <v-btn
        v-if="lead"
        color="primary"
        prepend-icon="mdi-pencil"
        @click="editMode = !editMode"
      >
        {{ editMode ? 'Cancel' : 'Edit' }}
      </v-btn>
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
      <!-- Lead Information -->
      <v-card
        variant="outlined"
        :style="{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          borderColor: 'var(--border)',
        }"
      >
        <v-card-title>Lead Information</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Name</div>
                <div class="font-weight-medium">{{ lead.name || 'N/A' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Email</div>
                <div class="font-weight-medium">{{ lead.email || 'N/A' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Phone</div>
                <div class="font-weight-medium">{{ lead.phone || 'N/A' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Stage</div>
                <v-select
                  v-if="editMode"
                  v-model="selectedStage"
                  :items="stages"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                />
                <v-chip v-else :color="getStageColor(lead.stageId)" size="small" variant="flat">
                  {{ getStageName(lead.stageId) }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" v-if="lead.vehicle">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Vehicle</div>
                <div class="font-weight-medium">
                  {{ lead.vehicle.title || lead.vehicle.registration || 'N/A' }}
                </div>
              </div>
            </v-col>
            <v-col cols="12" v-if="lead.message">
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis">Message</div>
                <div>{{ lead.message }}</div>
              </div>
            </v-col>
            <v-col cols="12" v-if="editMode">
              <v-btn
                color="primary"
                @click="updateStage"
                :loading="updating"
              >
                Update Stage
              </v-btn>
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
        <v-card-title>Messages</v-card-title>
        <v-card-text>
          <div v-if="messages.length === 0" class="text-center text-medium-emphasis py-4">
            No messages yet
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
                      {{ formatDate(message.createdAt) }}
                    </div>
                  </div>
                </div>
                <div>{{ message.message }}</div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Send Message -->
          <v-textarea
            v-model="newMessage"
            label="Send a message"
            variant="outlined"
            rows="3"
            class="mb-2"
          />
          <v-btn
            color="primary"
            @click="sendMessage"
            :loading="sending"
            :disabled="!newMessage.trim()"
          >
            Send Message
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLead, updateLeadStage, getLeadMessages, sendLeadMessage } from '@/api/dealer.api'
import type { LeadModel, LeadMessageModel } from '@/models/lead.model'
import { LeadStage } from '@/models/lead.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const lead = ref<LeadModel | null>(null)
const messages = ref<LeadMessageModel[]>([])
const editMode = ref(false)
const selectedStage = ref<number | null>(null)
const updating = ref(false)
const sending = ref(false)
const newMessage = ref('')

const stages = [
  { id: LeadStage.NEW, name: 'New' },
  { id: LeadStage.CONTACTED, name: 'Contacted' },
  { id: LeadStage.QUALIFIED, name: 'Qualified' },
  { id: LeadStage.QUOTED, name: 'Quoted' },
  { id: LeadStage.NEGOTIATING, name: 'Negotiating' },
  { id: LeadStage.WON, name: 'Won' },
  { id: LeadStage.LOST, name: 'Lost' },
]

const getStageName = (stageId: number) => {
  const stage = stages.find(s => s.id === stageId)
  return stage?.name || 'Unknown'
}

const getStageColor = (stageId: number) => {
  const colors: Record<number, string> = {
    [LeadStage.NEW]: 'blue',
    [LeadStage.CONTACTED]: 'cyan',
    [LeadStage.QUALIFIED]: 'green',
    [LeadStage.QUOTED]: 'orange',
    [LeadStage.NEGOTIATING]: 'purple',
    [LeadStage.WON]: 'success',
    [LeadStage.LOST]: 'error',
  }
  return colors[stageId] || 'grey'
}

const updateStage = async () => {
  if (!lead.value || !selectedStage.value) return

  try {
    updating.value = true
    await updateLeadStage(lead.value.id, { stage_id: selectedStage.value })
    await loadLead()
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update stage'
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
    error.value = (err as ApiErrorModel).message || 'Failed to send message'
  } finally {
    sending.value = false
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
    selectedStage.value = loadedLead.stageId
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load lead'
  } finally {
    loading.value = false
  }
}

const loadMessages = async () => {
  const leadId = route.params.id as string
  if (!leadId) return

  try {
    const loadedMessages = await getLeadMessages(leadId)
    messages.value = loadedMessages
  } catch (err) {
    console.error('Failed to load messages:', err)
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  await Promise.all([loadLead(), loadMessages()])
})
</script>

