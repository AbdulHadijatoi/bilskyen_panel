<template>
  <div class="meta-ads-guide">
    <PageHeader :title="t(`${i18nBase}.title`)" :subtitle="t(`${i18nBase}.subtitle`)">
      <template #actions>
        <PanelHelpHint
          :text="t(`${i18nBase}.help.page`)"
          location="bottom end"
          :max-width="420"
          :aria-label="t(`${i18nBase}.helpAria`)"
        />
      </template>
    </PageHeader>

    <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <!-- Overview -->
    <v-card variant="outlined" class="pa-4 mb-4 panel-card">
      <div class="meta-ads-guide__section-head">
        <h2 class="text-h6 mb-0">{{ t(`${i18nBase}.overviewTitle`) }}</h2>
        <PanelHelpHint
          :text="t(`${i18nBase}.help.overview`)"
          size="sm"
          :max-width="400"
          :aria-label="t(`${i18nBase}.helpAria`)"
        />
      </div>
      <p class="text-body-2 text-medium-emphasis mt-2 mb-3">{{ t(`${i18nBase}.overviewBody`) }}</p>
      <v-row dense>
        <v-col cols="12" md="6">
          <div class="meta-ads-guide__callout">
            <strong>{{ t(`${i18nBase}.catalogAdsLabel`) }}</strong>
            <p class="text-body-2 mb-0 mt-1">{{ t(`${i18nBase}.catalogAdsBlurb`) }}</p>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="meta-ads-guide__callout">
            <strong>{{ t(`${i18nBase}.marketplaceLabel`) }}</strong>
            <p class="text-body-2 mb-0 mt-1">{{ t(`${i18nBase}.marketplaceBlurb`) }}</p>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Prerequisites -->
    <v-card variant="outlined" class="pa-4 mb-4 panel-card">
      <div class="meta-ads-guide__section-head">
        <h2 class="text-h6 mb-0">{{ t(`${i18nBase}.prerequisitesTitle`) }}</h2>
        <PanelHelpHint
          :text="t(`${i18nBase}.help.prerequisites`)"
          size="sm"
          :max-width="400"
          :aria-label="t(`${i18nBase}.helpAria`)"
        />
      </div>
      <ol class="meta-ads-guide__steps mt-2 mb-0">
        <li v-for="n in 4" :key="n">{{ t(`${i18nBase}.prerequisites.${n}`) }}</li>
      </ol>
      <div v-if="mode === 'admin'" class="mt-3">
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          :to="'/admin/integrations'"
          prepend-icon="mdi-connection"
        >
          {{ t(`${i18nBase}.openIntegrations`) }}
        </v-btn>
      </div>
      <div v-else class="mt-3 d-flex flex-wrap ga-2">
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          :to="'/feeds-syndication'"
          prepend-icon="mdi-rss"
        >
          {{ t(`${i18nBase}.openFeeds`) }}
        </v-btn>
      </div>
    </v-card>

    <!-- Feed URL -->
    <v-card variant="outlined" class="pa-4 mb-4 panel-card">
      <div class="meta-ads-guide__section-head">
        <h2 class="text-h6 mb-0">{{ t(`${i18nBase}.feedTitle`) }}</h2>
        <PanelHelpHint
          :text="t(`${i18nBase}.help.feed`)"
          size="sm"
          :max-width="400"
          :aria-label="t(`${i18nBase}.helpAria`)"
        />
      </div>
      <p class="text-body-2 text-medium-emphasis mt-2">{{ t(`${i18nBase}.feedBody`) }}</p>
      <div v-if="feedUrl" class="meta-ads-guide__feed-row">
        <code class="meta-ads-guide__feed-url">{{ feedUrl }}</code>
        <v-btn size="small" color="primary" variant="tonal" @click="copyText(feedUrl)">
          {{ t('common.copy') }}
        </v-btn>
      </div>
      <v-alert v-else type="warning" variant="tonal" class="mt-2" density="compact">
        {{ t(`${i18nBase}.feedMissing`) }}
      </v-alert>
      <p v-if="mode === 'admin' && pixelId" class="text-caption text-medium-emphasis mt-2 mb-0">
        {{ t(`${i18nBase}.pixelStatus`, { id: pixelId, status: pixelEnabled ? t(`${i18nBase}.pixelOn`) : t(`${i18nBase}.pixelOff`) }) }}
      </p>
    </v-card>

    <!-- Car selector -->
    <v-card variant="outlined" class="pa-4 mb-4 panel-card">
      <div class="meta-ads-guide__section-head">
        <h2 class="text-h6 mb-0">{{ t(`${i18nBase}.carSelectorTitle`) }}</h2>
        <PanelHelpHint
          :text="t(`${i18nBase}.help.carSelector`)"
          size="sm"
          :max-width="400"
          :aria-label="t(`${i18nBase}.helpAria`)"
        />
      </div>
      <p class="text-body-2 text-medium-emphasis mt-2 mb-3">{{ t(`${i18nBase}.carSelectorBody`) }}</p>
      <v-autocomplete
        v-model="selectedVehicleId"
        :items="vehicleItems"
        :loading="searching"
        :search="searchQuery"
        item-title="title"
        item-value="id"
        :label="t(`${i18nBase}.searchVehicles`)"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        no-filter
        @update:search="onSearch"
      />

      <div v-if="loadingPreview" class="text-center py-6">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else-if="preview">
        <v-divider class="my-4" />
        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
          <div>
            <div class="text-subtitle-1 font-weight-medium">{{ preview.vehicle.title }}</div>
            <a :href="preview.vehicle.detail_url" target="_blank" rel="noopener" class="text-body-2">
              {{ preview.vehicle.detail_url }}
            </a>
          </div>
          <v-chip :color="preview.ready ? 'success' : 'warning'" size="small" variant="tonal">
            {{ preview.ready ? t(`${i18nBase}.ready`) : t(`${i18nBase}.needsWork`) }}
          </v-chip>
        </div>

        <div class="meta-ads-guide__section-head mb-2">
          <h3 class="text-subtitle-2 mb-0">{{ t(`${i18nBase}.readinessTitle`) }}</h3>
          <PanelHelpHint
            :text="t(`${i18nBase}.help.readiness`)"
            size="sm"
            :max-width="360"
            :aria-label="t(`${i18nBase}.helpAria`)"
          />
        </div>
        <div class="meta-ads-guide__checks mb-4">
          <div
            v-for="check in preview.readiness"
            :key="check.key"
            class="meta-ads-guide__check"
            :class="check.ok ? 'meta-ads-guide__check--ok' : 'meta-ads-guide__check--fail'"
          >
            <v-icon size="16" :icon="check.ok ? 'mdi-check-circle' : 'mdi-alert-circle'" />
            <span>{{ t(`${i18nBase}.readiness.${check.label}`) }}</span>
          </div>
        </div>

        <div class="meta-ads-guide__section-head mb-2">
          <h3 class="text-subtitle-2 mb-0">{{ t(`${i18nBase}.catalogRowTitle`) }}</h3>
          <PanelHelpHint
            :text="t(`${i18nBase}.help.catalogRow`)"
            size="sm"
            :max-width="360"
            :aria-label="t(`${i18nBase}.helpAria`)"
          />
        </div>
        <v-btn size="small" class="mb-2" variant="tonal" @click="copyText(rowJson)">
          {{ t(`${i18nBase}.copyRow`) }}
        </v-btn>
        <pre class="meta-ads-guide__row">{{ rowJson }}</pre>

        <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
          {{ t(`${i18nBase}.clickThroughExplain`) }}
        </p>
      </template>
    </v-card>

    <!-- Steps tabs -->
    <v-card variant="outlined" class="pa-4 mb-4 panel-card">
      <v-tabs v-model="tab" color="primary" class="mb-2">
        <v-tab value="catalog">{{ t(`${i18nBase}.tabCatalogAds`) }}</v-tab>
        <v-tab value="marketplace">{{ t(`${i18nBase}.tabMarketplace`) }}</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="catalog">
          <div class="meta-ads-guide__section-head mt-2">
            <h3 class="text-subtitle-1 mb-0">{{ t(`${i18nBase}.catalogStepsTitle`) }}</h3>
            <PanelHelpHint
              :text="t(`${i18nBase}.help.catalogSteps`)"
              size="sm"
              :max-width="400"
              :aria-label="t(`${i18nBase}.helpAria`)"
            />
          </div>
          <ol class="meta-ads-guide__steps mt-2">
            <li v-for="n in 6" :key="n">
              <span v-html="stepHtml(`${i18nBase}.catalogSteps.${n}`)" />
            </li>
          </ol>
          <p v-if="preview" class="text-body-2 mt-2">
            {{ t(`${i18nBase}.catalogExample`, { title: preview.vehicle.title, url: preview.vehicle.detail_url }) }}
          </p>
        </v-window-item>
        <v-window-item value="marketplace">
          <div class="meta-ads-guide__section-head mt-2">
            <h3 class="text-subtitle-1 mb-0">{{ t(`${i18nBase}.marketplaceStepsTitle`) }}</h3>
            <PanelHelpHint
              :text="t(`${i18nBase}.help.marketplaceSteps`)"
              size="sm"
              :max-width="400"
              :aria-label="t(`${i18nBase}.helpAria`)"
            />
          </div>
          <ol class="meta-ads-guide__steps mt-2">
            <li v-for="n in 5" :key="n">
              <span v-html="stepHtml(`${i18nBase}.marketplaceSteps.${n}`)" />
            </li>
          </ol>
          <p v-if="preview" class="text-body-2 mt-2">
            {{ t(`${i18nBase}.marketplaceExample`, { title: preview.vehicle.title }) }}
          </p>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Troubleshooting -->
    <v-card variant="outlined" class="pa-4 panel-card">
      <div class="meta-ads-guide__section-head">
        <h2 class="text-h6 mb-0">{{ t(`${i18nBase}.troubleshootingTitle`) }}</h2>
        <PanelHelpHint
          :text="t(`${i18nBase}.help.troubleshooting`)"
          size="sm"
          :max-width="400"
          :aria-label="t(`${i18nBase}.helpAria`)"
        />
      </div>
      <ul class="meta-ads-guide__tips mt-2 mb-0">
        <li v-for="n in 4" :key="n">{{ t(`${i18nBase}.troubleshooting.${n}`) }}</li>
      </ul>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/panel/PageHeader.vue'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'
import { getVehicles as getDealerVehicles, getDealerMetaCatalogPreview, getDealerMetaFeedUrl } from '@/api/dealer.api'
import { getVehicles as getAdminVehicles, getAdminMetaCatalogPreview, getAdminMetaFeedUrl } from '@/api/admin.api'
import type { MetaCatalogPreview } from '@/api/dealer.api'

const props = defineProps<{
  mode: 'dealer' | 'admin'
}>()

const { t } = useI18n()
const i18nBase = computed(() =>
  props.mode === 'admin' ? 'admin.views.metaAdsGuide' : 'dealer.views.metaAdsGuide'
)

const tab = ref('catalog')
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('success')
const feedUrl = ref<string | null>(null)
const pixelEnabled = ref(false)
const pixelId = ref('')
const searchQuery = ref('')
const searching = ref(false)
const vehicleItems = ref<Array<{ id: number; title: string }>>([])
const selectedVehicleId = ref<number | null>(null)
const preview = ref<MetaCatalogPreview | null>(null)
const loadingPreview = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const rowJson = computed(() =>
  preview.value ? JSON.stringify(preview.value.row, null, 2) : ''
)

function stepHtml(key: string) {
  const text = t(key, { feedUrl: feedUrl.value || t(`${i18nBase.value}.feedPlaceholder`) })
  return text
}

async function loadFeed() {
  try {
    if (props.mode === 'admin') {
      const data = await getAdminMetaFeedUrl()
      feedUrl.value = data.feed_url
      pixelEnabled.value = !!data.pixel_enabled
      pixelId.value = data.pixel_id || ''
    } else {
      const data = await getDealerMetaFeedUrl()
      feedUrl.value = data.feed_url
    }
  } catch {
    feedUrl.value = null
  }
}

async function searchVehicles(q: string) {
  searching.value = true
  try {
    const params = { search: q || undefined, page: 1, limit: 20, list_status_id: 2 }
    const result =
      props.mode === 'admin' ? await getAdminVehicles(params) : await getDealerVehicles(params)
    vehicleItems.value = (result.docs || []).map((v: any) => ({
      id: v.id,
      title: v.title || `#${v.id}`,
    }))
  } catch {
    vehicleItems.value = []
  } finally {
    searching.value = false
  }
}

function onSearch(q: string) {
  searchQuery.value = q
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchVehicles(q), 300)
}

async function loadPreview(id: number) {
  loadingPreview.value = true
  preview.value = null
  try {
    preview.value =
      props.mode === 'admin'
        ? await getAdminMetaCatalogPreview(id)
        : await getDealerMetaCatalogPreview(id)
    if (preview.value.feed_url) {
      feedUrl.value = preview.value.feed_url
    }
  } catch {
    message.value = t(`${i18nBase.value}.previewFailed`)
    messageType.value = 'error'
  } finally {
    loadingPreview.value = false
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    message.value = t(`${i18nBase.value}.copied`)
    messageType.value = 'success'
  } catch {
    message.value = t(`${i18nBase.value}.copyFailed`)
    messageType.value = 'error'
  }
}

watch(selectedVehicleId, (id) => {
  if (id) loadPreview(id)
  else preview.value = null
})

loadFeed()
searchVehicles('')
</script>

<style scoped>
.meta-ads-guide__section-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.meta-ads-guide__callout {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 0.875rem 1rem;
  height: 100%;
}
.meta-ads-guide__steps,
.meta-ads-guide__tips {
  padding-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
}
.meta-ads-guide__feed-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
}
.meta-ads-guide__feed-url {
  flex: 1;
  min-width: 0;
  font-size: 0.8rem;
  word-break: break-all;
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}
.meta-ads-guide__checks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}
.meta-ads-guide__check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}
.meta-ads-guide__check--ok {
  color: rgb(var(--v-theme-success));
}
.meta-ads-guide__check--fail {
  color: rgb(var(--v-theme-warning));
}
.meta-ads-guide__row {
  max-height: 280px;
  overflow: auto;
  font-size: 0.75rem;
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0;
}
</style>
