<template>
  <div class="panel-page lead-stages-admin-container">
    <PageHeader
      title="Lead-faser"
      subtitle="Rediger titlerne på lead-faserne, som vises i forhandlerpanelet (kanban og detaljevisning)."
    >
      <template #actions>
        <button
          type="button"
          class="panel-btn panel-btn--outline"
          :disabled="loading"
          @click="loadStages"
        >
          <v-icon size="16">mdi-refresh</v-icon>
          Opdater
        </button>
      </template>
    </PageHeader>

    <div class="panel-table-card">
      <div class="panel-table-card__body">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>

        <div v-else-if="listError" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>{{ listError }}</v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="stages"
          density="compact"
          class="panel-data-table panel-data-table--inline-edit"
          elevation="0"
          hide-default-footer
        >
          <template #item.id="{ item }">
            <span class="panel-id-cell">#{{ item.id }}</span>
          </template>

          <template #item.name="{ item }">
            <input
              v-model="editNames[item.id]"
              type="text"
              class="panel-inline-input"
              maxlength="50"
              :aria-label="`Titel for fase ${item.id}`"
            />
          </template>

          <template #item.actions="{ item }">
            <div class="panel-row-actions">
              <button
                type="button"
                class="panel-btn panel-btn--primary panel-btn--sm"
                :disabled="editNames[item.id] === item.name"
                @click="saveStage(item.id)"
              >
                <v-progress-circular
                  v-if="savingId === item.id"
                  indeterminate
                  size="14"
                  width="2"
                />
                <template v-else>Gem</template>
              </button>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import {
  getAdminLeadStages,
  updateAdminLeadStage,
  type AdminLeadStageModel,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'

const loading = ref(false)
const listError = ref<string | null>(null)
const stages = ref<AdminLeadStageModel[]>([])
const editNames = reactive<Record<number, string>>({})
const savingId = ref<number | null>(null)

const headers = [
  { title: 'ID', key: 'id', width: '88px', sortable: false },
  { title: 'Titel (dansk)', key: 'name', sortable: false },
  { title: 'Handling', key: 'actions', width: '120px', sortable: false, align: 'end' as const },
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error',
})

function syncEditNames(items: AdminLeadStageModel[]) {
  for (const stage of items) {
    editNames[stage.id] = stage.name
  }
}

async function loadStages() {
  try {
    loading.value = true
    listError.value = null
    const data = await getAdminLeadStages()
    stages.value = data
    syncEditNames(data)
  } catch (err) {
    listError.value = (err as ApiErrorModel).message || 'Kunne ikke indlæse lead-faser'
  } finally {
    loading.value = false
  }
}

async function saveStage(id: number) {
  const name = editNames[id]?.trim()
  if (!name) return

  try {
    savingId.value = id
    const updated = await updateAdminLeadStage(id, { name })
    const index = stages.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      stages.value[index] = updated
    }
    editNames[id] = updated.name
    snackbar.value = { show: true, message: 'Fase gemt', color: 'success' }
  } catch (err) {
    snackbar.value = {
      show: true,
      message: (err as ApiErrorModel).message || 'Kunne ikke gemme fase',
      color: 'error',
    }
  } finally {
    savingId.value = null
  }
}

onMounted(() => {
  loadStages()
})
</script>

<style scoped>
.lead-stages-admin-container {
  max-width: 900px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}
</style>
