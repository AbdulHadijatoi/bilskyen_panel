<template>
  <div class="panel-page">
    <PageHeader :title="t('admin.views.ai.usageTitle')" :subtitle="t('admin.views.ai.usageSubtitle')" />

    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.provider"
              :items="providerOptions"
              :label="t('admin.views.ai.filterProvider')"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.task"
              :items="taskOptions"
              :label="t('admin.views.ai.filterTask')"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              :label="t('admin.views.ai.filterStatus')"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn color="primary" variant="flat" :loading="loading" @click="load(1)">
              {{ t('common.filter') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <v-data-table
      :headers="headers"
      :items="logs"
      :loading="loading"
      item-value="id"
      class="panel-table"
    >
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
      <template #item.dealer="{ item }">
        <span v-if="item.dealer">{{ item.dealer.slug || item.dealer.cvr || `#${item.dealer.id}` }}</span>
        <span v-else class="text-medium-emphasis">—</span>
      </template>
      <template #item.user="{ item }">
        <span v-if="item.user">{{ item.user.name || item.user.email }}</span>
        <span v-else class="text-medium-emphasis">—</span>
      </template>
      <template #item.tokens="{ item }">
        {{ item.prompt_tokens + item.completion_tokens }}
      </template>
      <template #item.status="{ item }">
        <v-chip size="x-small" :color="item.status === 'success' ? 'success' : 'error'" variant="tonal">
          {{ item.status }}
        </v-chip>
      </template>
      <template #item.error_message="{ item }">
        <span class="text-truncate d-inline-block" style="max-width: 200px">{{ item.error_message || '—' }}</span>
      </template>
    </v-data-table>

    <div v-if="hasNextPage" class="text-center mt-4">
      <v-btn variant="outlined" :loading="loading" @click="load(page + 1)">
        {{ t('admin.views.ai.loadMore') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAiUsageLogs, type AiUsageLogModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import { getIntlLocale } from '@/utils/defaultLocale'

const { t } = useI18n()

const logs = ref<AiUsageLogModel[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const hasNextPage = ref(false)

const filters = ref({
  provider: null as string | null,
  task: null as string | null,
  status: null as string | null,
})

const providerOptions = ['openai', 'anthropic', 'gemini']
const taskOptions = [
  'vehicle_description',
  'vehicle_title',
  'vehicle_highlights',
  'seo_meta',
  'enquiry_reply',
  'lead_summary',
  'listing_description',
  'cms_rewrite',
]
const statusOptions = ['success', 'failed']

const headers = computed(() => [
  { title: t('admin.views.ai.colDate'), key: 'created_at' },
  { title: t('admin.views.ai.colDealer'), key: 'dealer' },
  { title: t('admin.views.ai.colUser'), key: 'user' },
  { title: t('admin.views.ai.colTask'), key: 'task' },
  { title: t('admin.views.ai.colProvider'), key: 'provider' },
  { title: t('admin.views.ai.colTokens'), key: 'tokens' },
  { title: t('admin.views.ai.colStatus'), key: 'status' },
  { title: t('admin.views.ai.colError'), key: 'error_message' },
])

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString(getIntlLocale())
  } catch {
    return value
  }
}

async function load(nextPage = 1) {
  loading.value = true
  error.value = null
  try {
    const result = await getAiUsageLogs({
      page: nextPage,
      limit: 30,
      provider: filters.value.provider || undefined,
      task: filters.value.task || undefined,
      status: filters.value.status || undefined,
    })
    if (nextPage === 1) {
      logs.value = result.docs
    } else {
      logs.value = [...logs.value, ...result.docs]
    }
    page.value = result.page
    hasNextPage.value = result.hasNextPage
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.ai.usageLoadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => load(1))
</script>
