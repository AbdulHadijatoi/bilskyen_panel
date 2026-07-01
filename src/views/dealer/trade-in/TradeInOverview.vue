<template>
  <div>
    <h1 class="text-h5 font-weight-medium mb-4">{{ t('dealer.views.tradeIn.title') }}</h1>
    <v-card variant="outlined">
      <v-table v-if="items.length" density="comfortable">
        <thead>
          <tr>
            <th>{{ t('common.id') }}</th>
            <th>{{ t('dealer.views.tradeIn.plate') }}</th>
            <th>{{ t('common.status') }}</th>
            <th>{{ t('dealer.views.tradeIn.offered') }}</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.licence_plate || t('common.emDash') }}</td>
            <td>
              <v-select
                v-model="item.appraisal_status"
                :items="statusOptions"
                item-title="title"
                item-value="value"
                density="compact"
                hide-details
                variant="outlined"
                style="max-width: 160px"
                @update:model-value="save(item)"
              />
            </td>
            <td>
              <v-text-field
                v-model.number="item.offered_value_cents"
                type="number"
                density="compact"
                hide-details
                variant="outlined"
                style="max-width: 140px"
                @blur="save(item)"
              />
            </td>
            <td>
              <v-btn size="small" variant="text" :to="{ name: 'dealer.enquiries.detail', params: { id: item.enquiry_id } }" v-if="item.enquiry_id">
                {{ t('dealer.views.tradeIn.viewEnquiry') }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <p v-else class="pa-4 text-medium-emphasis">{{ t('dealer.views.tradeIn.empty') }}</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getTradeInRequests, updateTradeInRequest } from '@/api/dealer.api'

const { t } = useI18n()
const items = ref<any[]>([])

const statusOptions = computed(() => [
  { title: t('dealer.views.tradeIn.status.pending'), value: 'pending' },
  { title: t('dealer.views.tradeIn.status.in_review'), value: 'in_review' },
  { title: t('dealer.views.tradeIn.status.offered'), value: 'offered' },
  { title: t('dealer.views.tradeIn.status.accepted'), value: 'accepted' },
  { title: t('dealer.views.tradeIn.status.rejected'), value: 'rejected' },
])

async function load() {
  const data = await getTradeInRequests()
  items.value = data?.data ?? data?.docs ?? (Array.isArray(data) ? data : [])
}

async function save(item: any) {
  await updateTradeInRequest(item.id, {
    appraisal_status: item.appraisal_status,
    offered_value_cents: item.offered_value_cents,
  })
}

onMounted(load)
</script>
