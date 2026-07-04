<template>
  <v-card variant="flat" elevation="1">
    <v-card-title class="d-flex align-center flex-wrap gap-2">
      <v-icon size="20" class="mr-1">mdi-heart-pulse</v-icon>
      <span>{{ t('dealer.views.dashboard.listingHealthTitle') }}</span>
      <v-spacer />
      <v-chip
        v-if="data?.portfolio?.avg_score != null"
        size="small"
        variant="tonal"
        :color="data.portfolio.avg_score >= 70 ? 'success' : 'warning'"
      >
        {{ t('dealer.views.dashboard.portfolioHealth', { score: data.portfolio.avg_score }) }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ subtitleText }}
    </v-card-subtitle>
    <v-card-text>
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <template v-else-if="data">
        <div
          v-if="data.portfolio?.platform_avg_score"
          class="text-caption text-medium-emphasis mb-3"
        >
          {{ t('dealer.views.dashboard.platformBenchmark', {
            yours: data.portfolio.avg_score ?? '—',
            platform: data.portfolio.platform_avg_score,
          }) }}
          <span v-if="data.portfolio.trend_7d != null && data.portfolio.trend_7d !== 0">
            · {{ data.portfolio.trend_7d > 0 ? '+' : '' }}{{ data.portfolio.trend_7d }}
            {{ t('dealer.views.dashboard.trend7d') }}
          </span>
        </div>

        <div v-if="categoryChips.length" class="d-flex flex-wrap gap-2 mb-3">
          <v-chip
            v-for="chip in categoryChips"
            :key="chip.key"
            size="x-small"
            variant="outlined"
          >
            {{ chip.label }}: {{ chip.count }}
          </v-chip>
        </div>

        <div v-if="data.items?.length">
          <div
            v-for="item in data.items"
            :key="`${item.category || 'quality'}-${item.vehicle_id}`"
            class="attention-item mb-4 pb-3"
          >
            <div class="d-flex justify-space-between align-start gap-2 mb-1">
              <router-link
                :to="vehicleRoute(item.vehicle_id)"
                class="font-weight-medium text-decoration-none text-high-emphasis"
              >
                {{ item.title || `#${item.vehicle_id}` }}
              </router-link>
              <div class="d-flex align-center gap-1">
                <v-chip
                  v-if="item.category && item.category !== 'quality'"
                  size="x-small"
                  variant="tonal"
                  color="info"
                >
                  {{ categoryLabel(item.category) }}
                </v-chip>
                <v-chip
                  size="small"
                  :color="item.score >= 70 ? 'success' : 'warning'"
                >
                  {{ item.score }}
                </v-chip>
              </div>
            </div>

            <p v-if="item.impact_label" class="text-caption text-medium-emphasis mb-2">
              {{ item.impact_label }}
            </p>

            <div v-if="item.issues?.length" class="mb-2">
              <div
                v-for="(issue, idx) in item.issues"
                :key="`${issue.key}-${idx}`"
                class="d-flex align-start gap-2 mb-1"
              >
                <v-chip size="x-small" :color="severityColor(issue.severity)" variant="tonal">
                  {{ severityLabel(issue.severity) }}
                </v-chip>
                <span class="text-caption">{{ issue.message }}</span>
              </div>
            </div>

            <div v-if="visibleActions(item).length" class="d-flex flex-wrap gap-2 mt-2">
              <template v-for="(action, actionIdx) in visibleActions(item)" :key="actionIdx">
                <AiGenerateButton
                  v-if="action.type === 'ai' && canUseAiFixes"
                  :task="String(action.task)"
                  :context="aiContext(item)"
                  context-type="vehicle"
                  :context-id="item.vehicle_id"
                  :label="String(action.label)"
                />
                <v-btn
                  v-else-if="action.type === 'apply_price' && canApplyPrice"
                  size="x-small"
                  variant="flat"
                  color="primary"
                  :loading="applyingPriceFor === item.vehicle_id"
                  @click="runApplyPriceAction(item, action)"
                >
                  {{ action.label }}
                  <span v-if="action.suggested_price" class="ml-1 text-caption">
                    ({{ formatPrice(action.suggested_price) }})
                  </span>
                </v-btn>
                <v-btn
                  v-else-if="action.type !== 'ai' && action.type !== 'apply_price' && canUseActions"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  @click="runNavigateAction(item, action)"
                >
                  {{ action.label }}
                  <span
                    v-if="action.suggested_min && action.suggested_max"
                    class="ml-1 text-caption"
                  >
                    ({{ formatPrice(action.suggested_min) }}–{{ formatPrice(action.suggested_max) }})
                  </span>
                </v-btn>
              </template>
            </div>
            <UpgradePrompt
              v-else-if="item.issues?.length && !canUseActions && !canUseAiFixes"
              :feature-key="FeatureKey.LISTING_HEALTH_ACTIONS"
            />
          </div>
        </div>

        <p v-else class="text-medium-emphasis mb-0">
          {{ t('dealer.views.dashboard.noListingIssues') }}
        </p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AiGenerateButton from '@/components/ai/AiGenerateButton.vue'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import type { ListingHealthAttention } from '@/api/dealer.api'
import { applyVehicleSuggestedPrice } from '@/api/dealer.api'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'

const props = defineProps<{
  data: ListingHealthAttention | null
  loading: boolean
}>()

const emit = defineEmits<{
  'price-applied': []
}>()

const router = useRouter()
const { t } = useI18n()

const canUseActions = hasFeature(FeatureKey.LISTING_HEALTH_ACTIONS)
const canUseAiFixes = hasFeature(FeatureKey.LISTING_HEALTH_AI_FIXES)
const canApplyPrice = hasFeature(FeatureKey.LISTING_HEALTH_PRICE_APPLY)
const applyingPriceFor = ref<number | null>(null)

const subtitleText = computed(() => {
  const count = props.data?.portfolio?.attention_count ?? props.data?.count ?? 0
  if (count > 0) {
    return t('dealer.views.dashboard.listingHealthSubtitleActive', { count })
  }

  return t('dealer.views.dashboard.listingHealthSubtitle')
})

const categoryChips = computed(() => {
  const categories = props.data?.categories
  if (!categories) return []

  return [
    { key: 'quality', label: t('dealer.views.dashboard.attentionQuality'), count: categories.quality },
    { key: 'expiring', label: t('dealer.views.dashboard.attentionExpiring'), count: categories.expiring },
    { key: 'incomplete', label: t('dealer.views.dashboard.attentionIncomplete'), count: categories.incomplete },
  ].filter((chip) => chip.count > 0)
})

function vehicleRoute(vehicleId: number) {
  return { name: 'dealer.vehicles.detail', params: { id: vehicleId } }
}

function categoryLabel(category: string) {
  const map: Record<string, string> = {
    expiring: t('dealer.views.dashboard.attentionExpiring'),
    incomplete: t('dealer.views.dashboard.attentionIncomplete'),
    quality: t('dealer.views.dashboard.attentionQuality'),
  }

  return map[category] || category
}

function severityColor(severity?: string) {
  return severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'
}

function severityLabel(severity?: string) {
  if (severity === 'high') return t('dealer.views.dashboard.severityHigh')
  if (severity === 'medium') return t('dealer.views.dashboard.severityMedium')

  return t('dealer.views.dashboard.severityLow')
}

function flattenActions(item: ListingHealthAttention['items'][number]) {
  const actions: Array<Record<string, unknown>> = []
  const seen = new Set<string>()

  for (const issue of item.issues || []) {
    for (const action of issue.actions || []) {
      const key = `${action.type}:${action.task || action.target}:${action.label}`
      if (seen.has(key)) continue
      seen.add(key)
      actions.push(action)
    }
  }

  return actions.slice(0, 4)
}

function visibleActions(item: ListingHealthAttention['items'][number]) {
  return flattenActions(item).filter((action) => {
    if (action.type === 'ai') return canUseAiFixes
    if (action.type === 'apply_price') return canApplyPrice
    return canUseActions
  })
}

function aiContext(item: ListingHealthAttention['items'][number]) {
  return {
    vehicle_id: item.vehicle_id,
    title: item.title,
    issues: (item.issues || []).map((issue) => issue.message),
    metrics: item.metrics,
    pricing: item.pricing,
  }
}

function runNavigateAction(
  item: ListingHealthAttention['items'][number],
  action: Record<string, unknown>,
) {
  const query: Record<string, string> = {}
  if (action.target) {
    query.focus = String(action.target)
  }

  router.push({
    name: 'dealer.vehicles.detail',
    params: { id: item.vehicle_id },
    query,
  })
}

async function runApplyPriceAction(
  item: ListingHealthAttention['items'][number],
  _action: Record<string, unknown>,
) {
  try {
    applyingPriceFor.value = item.vehicle_id
    await applyVehicleSuggestedPrice(item.vehicle_id)
    emit('price-applied')
  } finally {
    applyingPriceFor.value = null
  }
}

function formatPrice(value: unknown) {
  const price = Number(value)
  if (!price) return '—'

  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
</script>

<style scoped>
.attention-item {
  border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}

.attention-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
</style>
