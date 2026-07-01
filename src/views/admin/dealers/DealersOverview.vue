<template>
  <div>
    <div class="header-section mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">{{ t('admin.views.dealers.title') }}</h1>
      <p class="text-body-2 text-medium-emphasis">{{ t('admin.views.dealers.subtitle') }}</p>
    </div>

    <v-text-field
      v-model="search"
      :label="t('common.search')"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      class="mb-4"
      clearable
      @update:model-value="loadDealers"
    />

    <v-data-table
      :headers="headers"
      :items="dealers"
      :loading="loading"
      item-value="id"
      @click:row="(_: unknown, row: { item: { id: number } }) => openDealer(row.item.id)"
    >
      <template #item.owner="{ item }">
        {{ item.owner?.name || item.slug || '-' }}
      </template>
      <template #item.vehicles_count="{ item }">
        {{ item.vehicles?.length ?? item.vehicles_count ?? 0 }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDealers } from '@/api/admin.api'

const { t } = useI18n()
const router = useRouter()
const dealers = ref<any[]>([])
const loading = ref(false)
const search = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Owner', key: 'owner' },
  { title: 'CVR', key: 'cvr' },
  { title: 'City', key: 'city' },
  { title: 'Vehicles', key: 'vehicles_count' },
]

async function loadDealers() {
  loading.value = true
  try {
    const res = await getDealers({ search: search.value || undefined, limit: 50 })
    dealers.value = res.docs
  } finally {
    loading.value = false
  }
}

function openDealer(id: number) {
  router.push({ name: 'admin.dealers.detail', params: { id } })
}

onMounted(loadDealers)
</script>
