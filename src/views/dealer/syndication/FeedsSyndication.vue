<template>
  <div class="panel-page">
    <PageHeader
      :title="t('dealer.views.syndication.title')"
      :subtitle="t('dealer.views.syndication.subtitle')"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-sync"
          :loading="syncing"
          @click="runSync"
        >
          {{ t('dealer.views.syndication.syncNow') }}
        </v-btn>
      </template>
    </PageHeader>

    <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="d-flex align-center">
            {{ t('dealer.views.syndication.feedTokens') }}
            <v-spacer />
            <v-btn size="small" color="primary" prepend-icon="mdi-plus" :loading="creatingToken" @click="createToken">
              {{ t('dealer.views.syndication.addToken') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center py-6">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <template v-else>
              <v-table v-if="feedUrls.length > 0" density="comfortable">
                <thead>
                  <tr>
                    <th>{{ t('common.name') }}</th>
                    <th>{{ t('dealer.views.syndication.formatJson') }}</th>
                    <th>{{ t('dealer.views.syndication.formatXml') }}</th>
                    <th class="text-end">{{ t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(feed, index) in feedUrls" :key="index">
                    <td>{{ feed.name }}</td>
                    <td>
                      <v-btn size="x-small" variant="text" @click="copyUrl(feed.json)">{{ t('common.copy') }}</v-btn>
                    </td>
                    <td>
                      <v-btn size="x-small" variant="text" @click="copyUrl(feed.xml)">{{ t('common.copy') }}</v-btn>
                    </td>
                    <td class="text-end">
                      <v-btn
                        v-if="tokens[index]"
                        icon
                        size="x-small"
                        color="error"
                        variant="text"
                        @click="removeToken(tokens[index].id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <p v-else class="text-medium-emphasis text-body-2 mb-0">
                {{ t('dealer.views.syndication.noTokens') }}
              </p>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="mb-6">
          <v-card-title>{{ t('dealer.views.syndication.providers') }}</v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center py-6">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <template v-else>
              <div v-for="provider in providers" :key="provider.key" class="mb-4">
                <v-switch
                  v-model="provider.enabled"
                  :label="providerLabel(provider)"
                  color="primary"
                  hide-details
                />
                <p v-if="provider.description" class="text-caption text-medium-emphasis ml-12 mb-0">
                  {{ provider.description }}
                </p>
                <p v-if="provider.last_sync_at" class="text-caption text-medium-emphasis ml-12 mb-0">
                  {{ t('dealer.views.syndication.lastSync') }}: {{ formatDate(provider.last_sync_at) }}
                </p>
              </div>
              <v-btn color="primary" :loading="saving" @click="saveProviders">
                {{ t('common.save') }}
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined">
      <v-card-title>{{ t('dealer.views.syndication.recentLogs') }}</v-card-title>
      <v-card-text class="pa-0">
        <v-table v-if="logs.length > 0" density="comfortable">
          <thead>
            <tr>
              <th>{{ t('common.date') }}</th>
              <th>{{ t('dealer.views.syndication.provider') }}</th>
              <th>{{ t('common.status') }}</th>
              <th>{{ t('common.message') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatDate(log.created_at) }}</td>
              <td>{{ log.provider_key }}</td>
              <td>
                <v-chip :color="log.status === 'success' ? 'success' : 'error'" size="x-small" variant="tonal">
                  {{ log.status === 'success' ? t('dealer.views.syndication.logStatusSuccess') : t('dealer.views.syndication.logStatusError') }}
                </v-chip>
              </td>
              <td class="text-truncate" style="max-width: 320px;">{{ log.message || t('common.emDash') }}</td>
            </tr>
          </tbody>
        </v-table>
        <p v-else class="text-medium-emphasis text-body-2 pa-4 mb-0">
          {{ t('dealer.views.syndication.noLogs') }}
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createDealerFeedToken,
  deleteDealerFeedToken,
  getDealerFeeds,
  getDealerSyndication,
  syncDealerSyndicationNow,
  updateDealerSyndication,
  type DealerFeedTokenModel,
  type DealerFeedUrlsModel,
  type DealerSyndicationProviderModel,
  type SyndicationLogModel,
} from '@/api/dealer.api'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()

const loading = ref(false)
const saving = ref(false)
const syncing = ref(false)
const creatingToken = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const tokens = ref<DealerFeedTokenModel[]>([])
const feedUrls = ref<DealerFeedUrlsModel[]>([])
const providers = ref<DealerSyndicationProviderModel[]>([])
const logs = ref<SyndicationLogModel[]>([])

function providerLabel(provider: DealerSyndicationProviderModel) {
  const key = `dealer.views.syndication.providers.${provider.key}.name`
  const translated = t(key)
  if (translated !== key) return translated
  return provider.name || provider.key
}

function formatDate(value?: string | null) {
  if (!value) return t('common.emDash')
  return new Date(value).toLocaleString()
}

async function load() {
  loading.value = true
  try {
    const [feeds, syndication] = await Promise.all([getDealerFeeds(), getDealerSyndication()])
    tokens.value = feeds.tokens
    feedUrls.value = feeds.feed_urls
    providers.value = syndication.providers
    logs.value = syndication.logs
  } catch {
    message.value = t('dealer.views.syndication.loadFailed')
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function createToken() {
  creatingToken.value = true
  try {
    await createDealerFeedToken(t('dealer.views.syndication.defaultTokenName'))
    message.value = t('dealer.views.syndication.tokenCreated')
    messageType.value = 'success'
    await load()
  } catch {
    message.value = t('dealer.views.syndication.tokenCreateFailed')
    messageType.value = 'error'
  } finally {
    creatingToken.value = false
  }
}

async function removeToken(id: number) {
  try {
    await deleteDealerFeedToken(id)
    await load()
  } catch {
    message.value = t('dealer.views.syndication.tokenDeleteFailed')
    messageType.value = 'error'
  }
}

async function saveProviders() {
  saving.value = true
  try {
    await updateDealerSyndication(
      providers.value.map((p) => ({ provider_key: p.key, enabled: p.enabled }))
    )
    message.value = t('dealer.views.syndication.settingsSaved')
    messageType.value = 'success'
    await load()
  } catch {
    message.value = t('dealer.views.syndication.settingsSaveFailed')
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

async function runSync() {
  syncing.value = true
  try {
    const result = await syncDealerSyndicationNow()
    message.value = t('dealer.views.syndication.syncComplete', { count: result.synced })
    messageType.value = 'success'
    await load()
  } catch {
    message.value = t('dealer.views.syndication.syncFailed')
    messageType.value = 'error'
  } finally {
    syncing.value = false
  }
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    message.value = t('dealer.views.syndication.urlCopied')
    messageType.value = 'success'
  } catch {
    message.value = t('dealer.views.syndication.urlCopyFailed')
    messageType.value = 'error'
  }
}

onMounted(load)
</script>
