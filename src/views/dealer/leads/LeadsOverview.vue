<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Leads</h2>
        <p class="text-body-2 text-medium-emphasis">
          Track and manage customer leads. Follow up on inquiries and convert them into sales.
        </p>
      </div>
    </div>

    <v-card
      variant="outlined"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderColor: 'var(--border)',
      }"
    >
      <v-card-text>
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="error" class="text-center py-8">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <div v-else class="d-flex gap-4 overflow-x-auto" style="min-height: 500px;">
          <div
            v-for="stage in stages"
            :key="stage.id"
            class="flex-shrink-0"
            style="width: 300px;"
          >
            <div class="mb-2">
              <h3 class="text-subtitle-1 font-weight-bold">{{ stage.name }}</h3>
              <v-chip size="small" variant="flat" color="grey">
                {{ getLeadsByStage(stage.id).length }}
              </v-chip>
            </div>
            <v-card
              variant="outlined"
              class="mb-2"
              style="min-height: 400px; max-height: 600px; overflow-y: auto;"
            >
              <v-card-text>
                <div v-if="getLeadsByStage(stage.id).length === 0" class="text-center text-medium-emphasis py-4">
                  No leads
                </div>
                <div v-else class="d-flex flex-column gap-2">
                  <v-card
                    v-for="lead in getLeadsByStage(stage.id)"
                    :key="lead.id"
                    variant="outlined"
                    class="cursor-pointer"
                    @click="viewLead(lead.id)"
                    :style="{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                    }"
                  >
                    <v-card-text>
                      <div class="d-flex justify-space-between align-start mb-2">
                        <div>
                          <div class="font-weight-bold">{{ lead.name || 'Unknown' }}</div>
                          <div class="text-caption text-medium-emphasis">{{ lead.email || lead.phone || 'No contact' }}</div>
                        </div>
                        <v-menu>
                          <template #activator="{ props }">
                            <v-btn icon variant="text" size="small" v-bind="props">
                              <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                          </template>
                          <v-list>
                            <v-list-item @click="viewLead(lead.id)">
                              <v-list-item-title>View Details</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="assignLead(lead)">
                              <v-list-item-title>Assign</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>
                      <div v-if="lead.vehicle" class="text-caption text-medium-emphasis mb-1">
                        Vehicle: {{ lead.vehicle.title || lead.vehicle.registration || 'N/A' }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatDate(lead.createdAt) }}
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Assign Lead Dialog -->
    <v-dialog v-model="assignDialog" max-width="500">
      <v-card>
        <v-card-title>Assign Lead</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStaffId"
            :items="staffMembers"
            item-title="name"
            item-value="id"
            label="Assign to Staff Member"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="assignDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="handleAssignLead">Assign</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLeads, assignLead as assignLeadApi, getStaff } from '@/api/dealer.api'
import type { LeadModel } from '@/models/lead.model'
import { LeadStage } from '@/models/lead.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const leads = ref<LeadModel[]>([])
const staffMembers = ref<any[]>([])
const assignDialog = ref(false)
const selectedLead = ref<LeadModel | null>(null)
const selectedStaffId = ref<number | null>(null)

const stages = [
  { id: LeadStage.NEW, name: 'New' },
  { id: LeadStage.CONTACTED, name: 'Contacted' },
  { id: LeadStage.QUALIFIED, name: 'Qualified' },
  { id: LeadStage.QUOTED, name: 'Quoted' },
  { id: LeadStage.NEGOTIATING, name: 'Negotiating' },
  { id: LeadStage.WON, name: 'Won' },
  { id: LeadStage.LOST, name: 'Lost' },
]

const getLeadsByStage = (stageId: number) => {
  return leads.value.filter(lead => lead.stageId === stageId)
}

const viewLead = (leadId: number) => {
  router.push({ name: 'dealer.leads.detail', params: { id: leadId } })
}

const assignLead = (lead: LeadModel) => {
  selectedLead.value = lead
  assignDialog.value = true
}

const handleAssignLead = async () => {
  if (!selectedLead.value || !selectedStaffId.value) return

  try {
    loading.value = true
    await assignLeadApi(selectedLead.value.id, { assigned_to_id: selectedStaffId.value })
    await loadLeads()
    assignDialog.value = false
    selectedLead.value = null
    selectedStaffId.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to assign lead'
  } finally {
    loading.value = false
  }
}

const loadLeads = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getLeads({ page: 1, limit: 100 })
    leads.value = response.docs
  } catch (err) {
    const apiError = err as ApiErrorModel
    error.value = apiError?.message || 'Failed to load leads'
  } finally {
    loading.value = false
  }
}

const loadStaff = async () => {
  try {
    const staff = await getStaff()
    staffMembers.value = staff
  } catch (err) {
    console.error('Failed to load staff:', err)
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await Promise.all([loadLeads(), loadStaff()])
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

