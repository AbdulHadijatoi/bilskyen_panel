<template>
  <v-card
    variant="outlined"
    class="mt-4"
    :style="{
      backgroundColor: 'var(--card)',
      color: 'var(--card-foreground)',
      borderColor: 'var(--border)',
    }"
  >
    <v-card-title>{{ t('dealer.views.leadsDetail.crm.title') }}</v-card-title>
    <v-card-text>
      <v-tabs v-model="tab" density="compact" class="mb-4">
        <v-tab value="timeline">{{ t('dealer.views.leadsDetail.crm.timeline') }}</v-tab>
        <v-tab value="notes">{{ t('dealer.views.leadsDetail.crm.notes') }}</v-tab>
        <v-tab value="tasks">{{ t('dealer.views.leadsDetail.crm.tasks') }}</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="timeline">
          <v-list v-if="activities.length" density="compact">
            <v-list-item v-for="item in activities" :key="item.id">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.user?.name || t('common.system') }} · {{ formatDate(item.created_at) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div v-else class="text-medium-emphasis text-body-2">{{ t('common.noData') }}</div>
        </v-window-item>

        <v-window-item value="notes">
          <div class="d-flex justify-end mb-2">
            <AiGenerateButton
              v-if="leadContext"
              task="lead_summary"
              :context="leadContext"
              context-type="lead"
              :context-id="leadId"
              :label="t('dealer.views.ai.summarizeLead')"
              auto-generate
              :show-tone-selector="false"
              @accept="onAiSummaryAccept"
            />
          </div>
          <v-textarea
            v-model="newNote"
            :label="t('dealer.views.leadsDetail.crm.addNote')"
            rows="3"
            variant="outlined"
            class="mb-3"
          />
          <v-btn color="primary" size="small" :loading="savingNote" @click="addNote">
            {{ t('common.save') }}
          </v-btn>
          <v-list v-if="notes.length" class="mt-4" density="compact">
            <v-list-item v-for="note in notes" :key="note.id">
              <v-list-item-title class="text-wrap">{{ note.body }}</v-list-item-title>
              <v-list-item-subtitle>{{ note.user?.name }} · {{ formatDate(note.created_at) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="tasks">
          <v-row dense class="mb-3">
            <v-col cols="12" md="6">
              <v-text-field v-model="newTaskTitle" :label="t('dealer.views.leadsDetail.crm.taskTitle')" variant="outlined" density="compact" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="newTaskDue" type="datetime-local" :label="t('dealer.views.leadsDetail.crm.dueDate')" variant="outlined" density="compact" />
            </v-col>
            <v-col cols="12" md="2" class="d-flex align-center">
              <v-btn color="primary" size="small" :loading="savingTask" @click="addTask">{{ t('common.add') }}</v-btn>
            </v-col>
          </v-row>
          <v-list v-if="tasks.length" density="compact">
            <v-list-item v-for="task in tasks" :key="task.id">
              <template #prepend>
                <v-checkbox
                  :model-value="!!task.completed_at"
                  density="compact"
                  hide-details
                  @update:model-value="(v: boolean | null) => toggleTask(task, !!v)"
                />
              </template>
              <v-list-item-title :class="{ 'text-decoration-line-through': task.completed_at }">
                {{ task.title }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="task.due_at">{{ formatDate(task.due_at) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getLeadActivities,
  getLeadNotes,
  createLeadNote,
  getLeadTasks,
  createLeadTask,
  updateLeadTask,
} from '@/api/dealer.api'
import AiGenerateButton from '@/components/ai/AiGenerateButton.vue'
import { getIntlLocale } from '@/utils/defaultLocale'

const props = defineProps<{
  leadId: number
  leadContext?: Record<string, unknown>
}>()
const { t } = useI18n()

const tab = ref('timeline')
const activities = ref<any[]>([])
const notes = ref<any[]>([])
const tasks = ref<any[]>([])
const newNote = ref('')
const newTaskTitle = ref('')
const newTaskDue = ref('')
const savingNote = ref(false)
const savingTask = ref(false)

function formatDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleString(getIntlLocale())
}

function onAiSummaryAccept(text: string) {
  newNote.value = text
}

async function loadAll() {
  const [acts, nts, tks] = await Promise.all([
    getLeadActivities(props.leadId),
    getLeadNotes(props.leadId),
    getLeadTasks(props.leadId),
  ])
  activities.value = acts.docs ?? acts
  notes.value = nts
  tasks.value = tks
}

async function addNote() {
  if (!newNote.value.trim()) return
  savingNote.value = true
  try {
    await createLeadNote(props.leadId, { body: newNote.value.trim() })
    newNote.value = ''
    await loadAll()
    tab.value = 'timeline'
  } finally {
    savingNote.value = false
  }
}

async function addTask() {
  if (!newTaskTitle.value.trim()) return
  savingTask.value = true
  try {
    await createLeadTask(props.leadId, {
      title: newTaskTitle.value.trim(),
      due_at: newTaskDue.value || undefined,
    })
    newTaskTitle.value = ''
    newTaskDue.value = ''
    await loadAll()
  } finally {
    savingTask.value = false
  }
}

async function toggleTask(task: any, completed: boolean) {
  await updateLeadTask(props.leadId, task.id, { completed })
  await loadAll()
}

onMounted(loadAll)
watch(() => props.leadId, loadAll)
</script>
