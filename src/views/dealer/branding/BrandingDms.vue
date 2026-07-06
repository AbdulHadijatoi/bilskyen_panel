<template>
  <div class="panel-page branding-page">
    <PageHeader :title="t('dealer.views.branding.title')" :subtitle="t('dealer.views.branding.subtitle')">
      <template #actions>
        <PanelHelpHint
          :text="help('page')"
          location="bottom end"
          :max-width="400"
          :ariaLabel="t('dealer.views.branding.helpAria')"
        />
      </template>
    </PageHeader>

    <v-tabs v-model="tab" class="branding-tabs mb-4">
      <v-tab value="theme">{{ t('dealer.views.branding.tabTheme') }}</v-tab>
      <v-tab value="reviews">{{ t('dealer.views.branding.tabReviews') }}</v-tab>
      <v-tab value="dms">{{ t('dealer.views.branding.tabDms') }}</v-tab>
      <v-tab value="audit">{{ t('dealer.views.branding.tabAudit') }}</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- ── Branding tab ── -->
      <v-window-item value="theme">
        <BrandingTabIntro
          :title="t('dealer.views.branding.tabTheme')"
          :help="help('tabTheme')"
          :ariaLabel="t('dealer.views.branding.helpAria')"
        />
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4 mb-4 panel-card">
              <BrandingSectionHeader
                :title="t('dealer.views.branding.theme')"
                help-key="themeSection"
              />

              <BrandingField
                :label="t('dealer.views.branding.financeCalculatorEnabled')"
                help-key="financeCalculatorEnabled"
              >
                <v-select
                  v-model="form.finance_calculator_enabled"
                  :items="financeCalculatorOptions"
                  item-title="title"
                  item-value="value"
                  :disabled="!platformFinanceCalculatorEnabled"
                  :hint="financeCalculatorHint"
                  persistent-hint
                  hide-details="auto"
                  variant="outlined"
                  density="compact"
                />
              </BrandingField>

              <BrandingField
                :label="t('dealer.views.branding.financeUrl')"
                help-key="financePartnerUrl"
              >
                <v-text-field
                  v-model="form.finance_partner_url"
                  :placeholder="t('dealer.views.branding.financeUrl')"
                  hide-details="auto"
                  variant="outlined"
                  density="compact"
                />
              </BrandingField>

              <BrandingField
                :label="t('dealer.views.branding.primaryColor')"
                help-key="primaryColor"
              >
                <v-text-field
                  v-model="form.theme_primary_color"
                  placeholder="#03418b"
                  hide-details="auto"
                  variant="outlined"
                  density="compact"
                />
              </BrandingField>

              <BrandingField
                :label="t('dealer.views.branding.secondaryColor')"
                help-key="secondaryColor"
              >
                <v-text-field
                  v-model="form.theme_secondary_color"
                  placeholder="#f0f0f0"
                  hide-details="auto"
                  variant="outlined"
                  density="compact"
                />
              </BrandingField>

              <span class="branding-action-with-help">
                <v-btn color="primary" :loading="saving" @click="saveBranding">{{ t('common.save') }}</v-btn>
                <PanelHelpHint
                  :text="help('saveBranding')"
                  size="sm"
                  :max-width="360"
                  :ariaLabel="t('dealer.views.branding.helpAria')"
                />
              </span>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4 panel-card">
              <BrandingSectionHeader
                :title="t('dealer.views.branding.domains')"
                help-key="domainsSection"
              />

              <BrandingField
                :label="t('dealer.views.branding.cnameHint', { target: cnameTarget })"
                help-key="cnameSetup"
                flush
              />

              <BrandingField
                :label="t('dealer.views.branding.addDomain')"
                help-key="addDomain"
              >
                <v-text-field
                  v-model="newDomain"
                  :placeholder="t('dealer.views.branding.addDomain')"
                  hide-details="auto"
                  variant="outlined"
                  density="compact"
                />
              </BrandingField>

              <span class="branding-action-with-help mb-4">
                <v-btn @click="addDomain">{{ t('common.add') }}</v-btn>
              </span>

              <BrandingField
                v-if="domains.length"
                :label="t('dealer.views.branding.domains')"
                help-key="domainVerification"
                flush
              >
                <v-list density="compact" class="branding-domain-list">
                  <v-list-item
                    v-for="d in domains"
                    :key="d.id"
                    :title="d.domain"
                    :subtitle="d.verified_at ? t('common.verified') : t('common.pending')"
                  >
                    <template #append>
                      <v-btn v-if="!d.verified_at" size="x-small" @click="verify(d.id)">
                        {{ t('dealer.views.branding.verify') }}
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </BrandingField>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ── Reviews tab ── -->
      <v-window-item value="reviews">
        <BrandingTabIntro
          :title="t('dealer.views.branding.tabReviews')"
          :help="help('tabReviews')"
          :ariaLabel="t('dealer.views.branding.helpAria')"
        />
        <UpgradePrompt v-if="!canManageReviews" :feature-key="FeatureKey.REVIEW_MANAGEMENT" class="mb-4" />
        <v-card v-else variant="outlined" class="pa-4 panel-card">
          <BrandingSectionHeader
            :title="t('dealer.views.branding.reviewsTitle')"
            help-key="tabReviews"
          />

          <BrandingField
            :label="t('dealer.views.branding.googleReviewUrl')"
            help-key="googleReviewUrl"
          >
            <v-text-field
              v-model="form.google_review_url"
              placeholder="https://g.page/..."
              hide-details="auto"
              variant="outlined"
              density="compact"
            />
          </BrandingField>

          <BrandingField
            :label="t('dealer.views.branding.googlePlaceId')"
            help-key="googlePlaceId"
          >
            <v-text-field
              v-model="form.google_place_id"
              hide-details="auto"
              variant="outlined"
              density="compact"
            />
          </BrandingField>

          <span class="branding-action-with-help mb-4">
            <v-btn color="primary" :loading="saving" @click="saveBranding">{{ t('common.save') }}</v-btn>
            <PanelHelpHint
              :text="help('saveBranding')"
              size="sm"
              :max-width="360"
              :ariaLabel="t('dealer.views.branding.helpAria')"
            />
          </span>

          <v-alert v-if="reviewSummary?.configured" type="success" variant="tonal" density="compact">
            {{ t('dealer.views.branding.reviewsConfigured') }}
            <template v-if="reviewSummary?.widget_url">
              · <a :href="reviewSummary.widget_url" target="_blank" rel="noopener">{{ t('dealer.views.branding.openReviews') }}</a>
            </template>
          </v-alert>
          <v-alert v-else type="info" variant="tonal" density="compact">
            {{ t('dealer.views.branding.reviewsHint') }}
          </v-alert>
        </v-card>
      </v-window-item>

      <!-- ── DMS & API tab ── -->
      <v-window-item value="dms">
        <BrandingTabIntro
          :title="t('dealer.views.branding.tabDms')"
          :help="help('tabDms')"
          :ariaLabel="t('dealer.views.branding.helpAria')"
        />
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4 mb-4 panel-card">
              <BrandingSectionHeader
                :title="t('dealer.views.branding.apiAccessTitle')"
                help-key="apiAccessSection"
              />
              <UpgradePrompt v-if="!canUseApiAccess" :feature-key="FeatureKey.API_ACCESS" class="mb-3" />
              <template v-else>
                <BrandingField
                  :label="t('dealer.views.branding.apiEndpointHint', { endpoint: dmsData?.api_endpoint || '—' })"
                  help-key="apiEndpoint"
                  flush
                />

                <span class="branding-action-with-help mb-3">
                  <v-btn @click="createKey">{{ t('dealer.views.branding.createApiKey') }}</v-btn>
                  <PanelHelpHint
                    :text="help('createApiKey')"
                    size="sm"
                    :max-width="400"
                    :ariaLabel="t('dealer.views.branding.helpAria')"
                  />
                </span>

                <v-alert v-if="plainKey" type="info" class="mb-3" variant="tonal" density="compact">
                  {{ t('dealer.views.branding.apiKeyLabel', { key: plainKey }) }}
                </v-alert>

                <BrandingField
                  v-if="apiKeys.length"
                  :label="t('dealer.views.branding.apiKeysList')"
                  help-key="apiKeySecurity"
                  flush
                >
                  <v-list density="compact">
                    <v-list-item v-for="key in apiKeys" :key="key.id" :title="key.name" :subtitle="key.key_prefix">
                      <template #append>
                        <v-btn icon size="x-small" variant="text" color="error" @click="removeKey(key.id)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </BrandingField>
              </template>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4 mb-4 panel-card">
              <BrandingSectionHeader
                :title="t('dealer.views.branding.dmsTitle')"
                help-key="webhookSection"
              />
              <UpgradePrompt v-if="!canUseDmsSync" :feature-key="FeatureKey.DMS_SYNC" class="mb-3" />
              <template v-else>
                <BrandingField
                  :label="t('dealer.views.branding.webhookUrl')"
                  help-key="webhookUrl"
                >
                  <v-text-field
                    v-model="webhookUrl"
                    placeholder="https://your-server.com/webhooks/bilskyen"
                    hide-details="auto"
                    variant="outlined"
                    density="compact"
                  />
                </BrandingField>

                <span class="branding-action-with-help mb-2">
                  <v-btn @click="createHook">{{ t('dealer.views.branding.addWebhook') }}</v-btn>
                  <PanelHelpHint
                    :text="help('addWebhook')"
                    size="sm"
                    :max-width="400"
                    :ariaLabel="t('dealer.views.branding.helpAria')"
                  />
                </span>

                <BrandingField
                  help-key="webhookEvents"
                  :label="t('dealer.views.branding.webhookEventsLabel')"
                  flush
                  class="mb-4"
                />

                <v-list v-if="webhooks.length" density="compact" class="mb-4">
                  <v-list-item v-for="hook in webhooks" :key="hook.id" :title="hook.url" :subtitle="(hook.events || []).join(', ')">
                    <template #append>
                      <v-btn icon size="x-small" variant="text" color="error" @click="removeHook(hook.id)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>

                <BrandingSectionHeader
                  :title="t('dealer.views.branding.recentDeliveries')"
                  help-key="recentDeliveries"
                />
                <v-table v-if="deliveries.length" density="compact">
                  <thead>
                    <tr>
                      <th>{{ t('common.status') }}</th>
                      <th>{{ t('dealer.views.branding.event') }}</th>
                      <th>HTTP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="d in deliveries" :key="d.id">
                      <td>{{ d.status }}</td>
                      <td>{{ d.event }}</td>
                      <td>{{ d.response_code ?? '—' }}</td>
                    </tr>
                  </tbody>
                </v-table>
                <p v-else class="text-caption text-medium-emphasis">{{ t('dealer.views.branding.noDeliveries') }}</p>
              </template>
            </v-card>

            <span class="branding-action-with-help">
              <v-btn variant="outlined" @click="exportLeadPiiAudit">{{ t('dealer.views.branding.exportPiiAudit') }}</v-btn>
              <PanelHelpHint
                :text="help('exportPiiAudit')"
                size="sm"
                :max-width="400"
                :ariaLabel="t('dealer.views.branding.helpAria')"
              />
            </span>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ── Inventory audit tab ── -->
      <v-window-item value="audit">
        <BrandingTabIntro
          :title="t('dealer.views.branding.tabAudit')"
          :help="help('tabAudit')"
          :ariaLabel="t('dealer.views.branding.helpAria')"
        />
        <UpgradePrompt v-if="!canUseBrandedAudit" :feature-key="FeatureKey.BRANDED_INVENTORY_AUDIT" class="mb-4" />
        <v-card v-else variant="outlined" class="pa-4 panel-card">
          <BrandingSectionHeader
            :title="t('dealer.views.branding.auditTitle')"
            help-key="auditSection"
          />
          <p class="text-body-2 text-medium-emphasis mb-4">{{ t('dealer.views.branding.auditHint') }}</p>
          <v-alert v-if="auditLinkError" type="warning" variant="tonal" density="compact" class="mb-3">
            {{ auditLinkError }}
          </v-alert>

          <BrandingField
            :label="t('dealer.views.branding.auditShareUrl')"
            help-key="auditShareUrl"
          >
            <v-text-field
              :model-value="auditLink?.share_url || ''"
              readonly
              hide-details="auto"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-content-copy"
              @click:append-inner="copyAuditLink"
            />
          </BrandingField>

          <span v-if="auditLink?.share_url" class="branding-action-with-help mt-2">
            <v-btn variant="outlined" :href="auditLink.share_url" target="_blank">
              {{ t('dealer.views.branding.previewAudit') }}
            </v-btn>
            <PanelHelpHint
              :text="help('previewAudit')"
              size="sm"
              :max-width="400"
              :ariaLabel="t('dealer.views.branding.helpAria')"
            />
          </span>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import BrandingField from '@/components/dealer/branding/BrandingField.vue'
import BrandingSectionHeader from '@/components/dealer/branding/BrandingSectionHeader.vue'
import BrandingTabIntro from '@/components/dealer/branding/BrandingTabIntro.vue'
import PageHeader from '@/components/panel/PageHeader.vue'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'
import {
  addDealerDomain,
  createDealerApiKey,
  createDealerWebhook,
  deleteDealerApiKey,
  deleteDealerWebhook,
  exportLeadPiiAudit,
  getDealerAuditLink,
  getDealerBranding,
  getDealerDms,
  getDealerReviewSummary,
  updateDealerBranding,
  verifyDealerDomain,
} from '@/api/dealer.api'

const { t } = useI18n()

function help(key: string) {
  return t(`dealer.views.branding.help.${key}`)
}

const tab = ref('theme')
const saving = ref(false)
const platformFinanceCalculatorEnabled = ref(true)
const form = ref({
  finance_partner_url: '',
  finance_calculator_enabled: null as boolean | null,
  google_review_url: '',
  google_place_id: '',
  theme_primary_color: '',
  theme_secondary_color: '',
})
const domains = ref<any[]>([])
const cnameTarget = ref('')
const newDomain = ref('')
const plainKey = ref('')
const webhookUrl = ref('')
const dmsData = ref<any>(null)
const auditLink = ref<any>(null)
const auditLinkError = ref('')
const reviewSummary = ref<any>(null)

const canUseApiAccess = hasFeature(FeatureKey.API_ACCESS)
const canUseDmsSync = hasFeature(FeatureKey.DMS_SYNC)
const canManageReviews = hasFeature(FeatureKey.REVIEW_MANAGEMENT)
const canUseBrandedAudit = hasFeature(FeatureKey.BRANDED_INVENTORY_AUDIT)

const apiKeys = computed(() => dmsData.value?.api_keys || [])
const webhooks = computed(() => dmsData.value?.webhooks || [])
const deliveries = computed(() => dmsData.value?.recent_deliveries || [])

const financeCalculatorOptions = computed(() => [
  { title: t('dealer.views.branding.financeCalculatorInherit'), value: null },
  { title: t('dealer.views.branding.financeCalculatorOptionEnabled'), value: true },
  { title: t('dealer.views.branding.financeCalculatorOptionDisabled'), value: false },
])

const financeCalculatorHint = computed(() => {
  if (!platformFinanceCalculatorEnabled.value) {
    return t('dealer.views.branding.financeCalculatorPlatformOff')
  }
  return t('dealer.views.branding.financeCalculatorInherit')
})

async function loadBranding() {
  const data = await getDealerBranding()
  platformFinanceCalculatorEnabled.value = data.platform_finance_calculator_enabled !== false
  form.value = {
    finance_partner_url: data.finance_partner_url || '',
    finance_calculator_enabled: data.finance_calculator_enabled ?? null,
    google_review_url: data.google_review_url || '',
    google_place_id: data.google_place_id || '',
    theme_primary_color: data.theme_primary_color || '',
    theme_secondary_color: data.theme_secondary_color || '',
  }
  domains.value = data.domains || []
  cnameTarget.value = data.cname_target || ''
}

async function loadDms() {
  try {
    dmsData.value = await getDealerDms()
  } catch {
    dmsData.value = null
  }
}

async function loadPremiumSections() {
  if (canUseBrandedAudit) {
    auditLinkError.value = ''
    try {
      auditLink.value = await getDealerAuditLink()
    } catch (err: any) {
      auditLink.value = null
      auditLinkError.value = err?.message || t('dealer.views.branding.auditLinkFailed')
    }
  }
  if (canManageReviews) {
    try {
      reviewSummary.value = await getDealerReviewSummary()
    } catch {
      reviewSummary.value = null
    }
  }
}

async function load() {
  await Promise.all([loadBranding(), loadDms(), loadPremiumSections()])
}

async function saveBranding() {
  saving.value = true
  try {
    await updateDealerBranding(form.value)
    await loadBranding()
    if (canManageReviews) {
      reviewSummary.value = await getDealerReviewSummary()
    }
  } finally {
    saving.value = false
  }
}

async function addDomain() {
  if (!newDomain.value) return
  await addDealerDomain(newDomain.value)
  newDomain.value = ''
  await loadBranding()
}

async function verify(id: number) {
  await verifyDealerDomain(id)
  await loadBranding()
}

async function createKey() {
  const res = await createDealerApiKey(t('dealer.views.branding.defaultApiKeyName'))
  plainKey.value = res.plain_key
  await loadDms()
}

async function createHook() {
  if (!webhookUrl.value) return
  await createDealerWebhook(webhookUrl.value, ['vehicle.published', 'vehicle.updated'])
  webhookUrl.value = ''
  await loadDms()
}

async function removeKey(id: number) {
  await deleteDealerApiKey(id)
  await loadDms()
}

async function removeHook(id: number) {
  await deleteDealerWebhook(id)
  await loadDms()
}

function copyAuditLink() {
  if (auditLink.value?.share_url) {
    navigator.clipboard.writeText(auditLink.value.share_url)
  }
}

watch(tab, (value) => {
  if (value === 'dms') loadDms()
  if (value === 'audit' && canUseBrandedAudit) loadPremiumSections()
})

onMounted(load)
</script>

<style scoped>
.branding-action-with-help {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.branding-domain-list {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
</style>
