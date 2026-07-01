<template>
  <div class="panel-page lead-stages-admin-container">
    <PageHeader
      title="Lead-faser"
      subtitle="Rediger titlerne på lead-faserne, som vises i forhandlerpanelet (kanban og detaljevisning)."
    >
      <template #actions>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadStages"
        >
          Opdater
        </v-btn>
      </template>
    </PageHeader>

    <v-card variant="flat" class="table-card" elevation="0">
      <v-card-text class="pa-0">
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-alert v-else-if="listError" type="error" variant="tonal" class="ma-4">
          {{ listError }}
        </v-alert>

        <v-table v-else density="comfortable">
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th>Titel (dansk)</th>
              <th style="width: 120px;" class="text-right">Handling</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stage in stages" :key="stage.id">
              <td>{{ stage.id }}</td>
              <td>
                <v-text-field
                  v-model="editNames[stage.id]"
                  variant="outlined"
                  density="compact"
                  hide-details
                  maxlength="50"
                />
              </td>
              <td class="text-right">
                <v-btn
                  color="primary"
                  size="small"
                  variant="flat"
                  :loading="savingId === stage.id"
                  :disabled="editNames[stage.id] === stage.name"
                  @click="saveStage(stage.id)"
                >
                  Gem
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

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

.table-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
}
</style>
