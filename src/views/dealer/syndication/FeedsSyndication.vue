<template>
  <div class="panel-page">
    <PageHeader
      :title="t('dealer.views.syndication.title')"
      :subtitle="t('dealer.views.syndication.subtitle')"
    >
      <template #actions>
        <PanelHelpHint
          :text="help('page')"
          location="bottom end"
          :max-width="400"
          :aria-label="t('dealer.views.syndication.helpAria')"
        />
        <span v-if="canUseSyndication" class="syndication-action-with-help">
          <v-btn
            color="primary"
            prepend-icon="mdi-sync"
            :loading="syncing"
            @click="runSync"
          >
            {{ t('dealer.views.syndication.syncNow') }}
          </v-btn>
          <PanelHelpHint
            :text="help('syncNow')"
            size="sm"
            :max-width="400"
            :aria-label="t('dealer.views.syndication.helpAria')"
          />
        </span>
      </template>
    </PageHeader>

    <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <template v-if="!canUseFeeds && !canUseSyndication">
      <UpgradePrompt :feature-key="FeatureKey.INVENTORY_FEEDS" class="mb-4" />
      <UpgradePrompt :feature-key="FeatureKey.SYNDICATION" class="mb-4" />
    </template>

    <v-row v-else>
      <v-col cols="12" lg="6">
        <v-card v-if="canUseFeeds" variant="outlined" class="mb-6 pa-4 panel-card">
          <div class="syndication-card-header">
            <SyndicationSectionHeader
              :title="t('dealer.views.syndication.feedTokens')"
              help-key="feedTokensSection"
            />
            <span class="syndication-action-with-help">
              <v-btn size="small" color="primary" prepend-icon="mdi-plus" :loading="creatingToken" @click="createToken">
                {{ t('dealer.views.syndication.addToken') }}
              </v-btn>
              <PanelHelpHint
                :text="help('addToken')"
                size="sm"
                :max-width="400"
                :aria-label="t('dealer.views.syndication.helpAria')"
              />
            </span>
          </div>

          <div v-if="loadingFeeds" class="text-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <template v-else>
            <SyndicationField
              v-if="feedUrls.length > 0"
              :label="t('dealer.views.syndication.feedUrlsLabel')"
              help-key="feedUrls"
              flush
              class="mb-3"
            />
            <v-table v-if="feedUrls.length > 0" density="comfortable" class="syndication-feed-table mb-2">
              <thead>
                <tr>
                  <th>{{ t('common.name') }}</th>
                  <th>
                    <span class="syndication-table-heading">
                      {{ t('dealer.views.syndication.formatJson') }}
                      <PanelHelpHint
                        :text="help('formatJson')"
                        size="sm"
                        :max-width="340"
                        :aria-label="t('dealer.views.syndication.helpAria')"
                      />
                    </span>
                  </th>
                  <th>
                    <span class="syndication-table-heading">
                      {{ t('dealer.views.syndication.formatXml') }}
                      <PanelHelpHint
                        :text="help('formatXml')"
                        size="sm"
                        :max-width="340"
                        :aria-label="t('dealer.views.syndication.helpAria')"
                      />
                    </span>
                  </th>
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
        </v-card>
        <UpgradePrompt v-else :feature-key="FeatureKey.INVENTORY_FEEDS" class="mb-6" />
      </v-col>

      <v-col cols="12" lg="6">
        <v-card v-if="canUseSyndication" variant="outlined" class="mb-6 pa-4 panel-card">
          <SyndicationSectionHeader
            :title="t('dealer.views.syndication.providersTitle')"
            help-key="providersSection"
          />

          <div v-if="loadingSyndication" class="text-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <template v-else>
            <SyndicationField
              :label="t('dealer.views.syndication.providerToggleLabel')"
              help-key="providerToggle"
              flush
              class="mb-2"
            />

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

            <span class="syndication-action-with-help">
              <v-btn color="primary" :loading="saving" @click="saveProviders">
                {{ t('common.save') }}
              </v-btn>
              <PanelHelpHint
                :text="help('saveProviders')"
                size="sm"
                :max-width="400"
                :aria-label="t('dealer.views.syndication.helpAria')"
              />
            </span>
          </template>
        </v-card>
        <UpgradePrompt v-else :feature-key="FeatureKey.SYNDICATION" class="mb-6" />
      </v-col>
    </v-row>

    <v-card v-if="canUseSyndication" variant="outlined" class="pa-4 panel-card">
      <SyndicationSectionHeader
        :title="t('dealer.views.syndication.recentLogs')"
        help-key="recentLogs"
      />

      <SyndicationField
        v-if="logs.length > 0"
        :label="t('dealer.views.syndication.logTableLabel')"
        help-key="logTable"
        flush
        class="mb-3"
      />

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
      <p v-else class="text-medium-emphasis text-body-2 mb-0">
        {{ t('dealer.views.syndication.noLogs') }}
      </p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'
import SyndicationField from '@/components/dealer/syndication/SyndicationField.vue'
import SyndicationSectionHeader from '@/components/dealer/syndication/SyndicationSectionHeader.vue'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import { FeatureKey, hasFeature, isPlanFeatureError } from '@/utils/subscriptionFeatures'
import { getIntlLocale } from '@/utils/defaultLocale'

const feedsDeniedByServer = ref(false)
const syndicationDeniedByServer = ref(false)

const canUseFeeds = computed(
  () => hasFeature(FeatureKey.INVENTORY_FEEDS) && !feedsDeniedByServer.value
)
const canUseSyndication = computed(
  () => hasFeature(FeatureKey.SYNDICATION) && !syndicationDeniedByServer.value
)

const { t } = useI18n()

const help = (key: string) => t(`dealer.views.syndication.help.${key}`)

const loadingFeeds = ref(false)
const loadingSyndication = ref(false)
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
  return new Date(value).toLocaleString(getIntlLocale())
}

function denyFeatureFromError(error: unknown, feature: FeatureKey) {
  if (!isPlanFeatureError(error)) return false
  if (feature === FeatureKey.INVENTORY_FEEDS) feedsDeniedByServer.value = true
  if (feature === FeatureKey.SYNDICATION) syndicationDeniedByServer.value = true
  return true
}

async function loadFeeds() {
  if (!canUseFeeds.value) return

  loadingFeeds.value = true
  try {
    const feeds = await getDealerFeeds()
    tokens.value = feeds.tokens
    feedUrls.value = feeds.feed_urls
  } catch (error) {
    if (!denyFeatureFromError(error, FeatureKey.INVENTORY_FEEDS)) {
      message.value = t('dealer.views.syndication.loadFailed')
      messageType.value = 'error'
    }
  } finally {
    loadingFeeds.value = false
  }
}

async function loadSyndication() {
  if (!canUseSyndication.value) return

  loadingSyndication.value = true
  try {
    const syndication = await getDealerSyndication()
    providers.value = syndication.providers
    logs.value = syndication.logs
  } catch (error) {
    if (!denyFeatureFromError(error, FeatureKey.SYNDICATION)) {
      message.value = t('dealer.views.syndication.loadFailed')
      messageType.value = 'error'
    }
  } finally {
    loadingSyndication.value = false
  }
}

async function load() {
  await Promise.all([loadFeeds(), loadSyndication()])
}

async function createToken() {
  if (!canUseFeeds.value) return

  creatingToken.value = true
  try {
    await createDealerFeedToken(t('dealer.views.syndication.defaultTokenName'))
    message.value = t('dealer.views.syndication.tokenCreated')
    messageType.value = 'success'
    await loadFeeds()
  } catch (error) {
    if (!denyFeatureFromError(error, FeatureKey.INVENTORY_FEEDS)) {
      message.value = t('dealer.views.syndication.tokenCreateFailed')
      messageType.value = 'error'
    }
  } finally {
    creatingToken.value = false
  }
}

async function removeToken(id: number) {
  if (!canUseFeeds.value) return

  try {
    await deleteDealerFeedToken(id)
    await loadFeeds()
  } catch (error) {
    if (!denyFeatureFromError(error, FeatureKey.INVENTORY_FEEDS)) {
      message.value = t('dealer.views.syndication.tokenDeleteFailed')
      messageType.value = 'error'
    }
  }
}

async function saveProviders() {
  if (!canUseSyndication.value) return

  saving.value = true
  try {
    await updateDealerSyndication(
      providers.value.map((p) => ({ provider_key: p.key, enabled: p.enabled }))
    )
    message.value = t('dealer.views.syndication.settingsSaved')
    messageType.value = 'success'
    await loadSyndication()
  } catch (error) {
    if (!denyFeatureFromError(error, FeatureKey.SYNDICATION)) {
      message.value = t('dealer.views.syndication.settingsSaveFailed')
      messageType.value = 'error'
    }
  } finally {
    saving.value = false
  }
}

async function runSync() {
  if (!canUseSyndication.value) return

  syncing.value = true
  try {
    const result = await syncDealerSyndicationNow()
    message.value = t('dealer.views.syndication.syncComplete', { count: result.synced })
    messageType.value = 'success'
    await loadSyndication()
  } catch (error) {
    if (!denyFeatureFromError(error, FeatureKey.SYNDICATION)) {
      message.value = t('dealer.views.syndication.syncFailed')
      messageType.value = 'error'
    }
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

<style scoped>
.syndication-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.syndication-card-header :deep(.syndication-section-header) {
  margin-bottom: 0;
}

.syndication-action-with-help {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.syndication-table-heading {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.syndication-feed-table {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
</style>
