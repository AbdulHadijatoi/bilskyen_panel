<template>
  <div class="panel-page">
    <PageHeader
      :title="t('dealer.views.marketing.title')"
      :subtitle="t('dealer.views.marketing.subtitle')"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
          {{ t('dealer.views.marketing.createCampaign') }}
        </v-btn>
      </template>
    </PageHeader>

    <UpgradePrompt v-if="!canUseCampaigns" :feature-key="FeatureKey.MARKETING_CAMPAIGNS" class="mb-4" />

    <template v-else>
      <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" closable @click:close="message = ''">
        {{ message }}
      </v-alert>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-table v-else density="comfortable">
        <thead>
          <tr>
            <th>{{ t('common.name') }}</th>
            <th>{{ t('dealer.views.marketing.type') }}</th>
            <th>{{ t('dealer.views.marketing.audience') }}</th>
            <th>{{ t('common.status') }}</th>
            <th class="text-end">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="campaign in campaigns" :key="campaign.id">
            <td>{{ campaign.name }}</td>
            <td>{{ campaign.type }}</td>
            <td>{{ campaign.audience }}</td>
            <td>{{ campaign.status }}</td>
            <td class="text-end">
              <v-btn
                v-if="campaign.status === 'draft'"
                size="small"
                variant="text"
                color="primary"
                :loading="sendingId === campaign.id"
                @click="sendCampaign(campaign.id)"
              >
                {{ t('dealer.views.marketing.sendNow') }}
              </v-btn>
              <v-btn
                v-if="campaign.status === 'draft'"
                size="small"
                variant="text"
                color="error"
                @click="removeCampaign(campaign.id)"
              >
                {{ t('common.delete') }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>

    <v-dialog v-model="showDialog" max-width="560">
      <v-card>
        <v-card-title>{{ t('dealer.views.marketing.createCampaign') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" :label="t('common.name')" class="mb-2" />
          <v-select
            v-model="form.type"
            :items="typeOptions"
            item-title="title"
            item-value="value"
            :label="t('dealer.views.marketing.type')"
            class="mb-2"
          />
          <v-select
            v-model="form.audience"
            :items="audienceOptions"
            item-title="title"
            item-value="value"
            :label="t('dealer.views.marketing.audience')"
            class="mb-2"
          />
          <v-text-field v-model="form.subject" :label="t('dealer.views.marketing.subject')" class="mb-2" />
          <v-textarea v-model="form.body" :label="t('dealer.views.marketing.body')" rows="5" />
          <UpgradePrompt
            v-if="form.type === 'retargeting' && !canUseRetargeting"
            :feature-key="FeatureKey.RETARGETING"
            class="mt-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="creating" :disabled="form.type === 'retargeting' && !canUseRetargeting" @click="createCampaign">
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/panel/PageHeader.vue'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'
import {
  createMarketingCampaign,
  deleteMarketingCampaign,
  getMarketingCampaigns,
  sendMarketingCampaign,
} from '@/api/dealer.api'

const { t } = useI18n()
const canUseCampaigns = hasFeature(FeatureKey.MARKETING_CAMPAIGNS)
const canUseRetargeting = hasFeature(FeatureKey.RETARGETING)

const loading = ref(false)
const creating = ref(false)
const sendingId = ref<number | null>(null)
const campaigns = ref<any[]>([])
const showDialog = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const form = ref({
  name: '',
  type: 'email',
  audience: 'all_leads',
  subject: '',
  body: '',
})

const typeOptions = computed(() => [
  { title: t('dealer.views.marketing.typeEmail'), value: 'email' },
  { title: t('dealer.views.marketing.typeRetargeting'), value: 'retargeting' },
])

const audienceOptions = computed(() => [
  { title: t('dealer.views.marketing.audienceAll'), value: 'all_leads' },
  { title: t('dealer.views.marketing.audienceStale'), value: 'stale_leads' },
  { title: t('dealer.views.marketing.audienceViewers'), value: 'vehicle_viewers' },
])

async function load() {
  if (!canUseCampaigns) return
  loading.value = true
  try {
    campaigns.value = await getMarketingCampaigns()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { name: '', type: 'email', audience: 'all_leads', subject: '', body: '' }
  showDialog.value = true
}

async function createCampaign() {
  creating.value = true
  try {
    await createMarketingCampaign(form.value)
    showDialog.value = false
    message.value = t('dealer.views.marketing.created')
    messageType.value = 'success'
    await load()
  } catch (err: any) {
    message.value = err?.message || t('dealer.views.marketing.failed')
    messageType.value = 'error'
  } finally {
    creating.value = false
  }
}

async function sendCampaign(id: number) {
  const campaign = campaigns.value.find((c) => c.id === id)
  if (campaign && (!campaign.subject?.trim() || !campaign.body?.trim())) {
    message.value = t('dealer.views.marketing.missingContent')
    messageType.value = 'error'
    return
  }

  sendingId.value = id
  try {
    const result = await sendMarketingCampaign(id)
    message.value = t('dealer.views.marketing.sent', { count: result.queued })
    messageType.value = 'success'
    await load()
  } catch (err: any) {
    message.value = err?.message || t('dealer.views.marketing.failed')
    messageType.value = 'error'
  } finally {
    sendingId.value = null
  }
}

async function removeCampaign(id: number) {
  await deleteMarketingCampaign(id)
  await load()
}

onMounted(load)
</script>
