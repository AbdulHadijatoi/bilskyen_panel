<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Subscription</h2>
        <p class="text-body-2 text-medium-emphasis">
          View your current subscription plan and features.
        </p>
      </div>
    </div>

    <div class="d-flex flex-column gap-4">
      <!-- Current Subscription -->
      <v-card
        variant="outlined"
        :style="{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          borderColor: 'var(--border)',
        }"
      >
        <v-card-title>Current Subscription</v-card-title>
        <v-card-text>
          <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="error" class="text-center py-8">
            <v-alert type="error" variant="tonal">
              {{ error }}
            </v-alert>
          </div>

          <div v-else-if="subscription">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">Plan</div>
                  <div class="font-weight-medium">{{ subscription.plan?.name || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">Status</div>
                  <v-chip
                    :color="getStatusColor(subscription.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ subscription.status || 'N/A' }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="subscription.starts_at">
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">Start Date</div>
                  <div>{{ formatDate(subscription.starts_at) }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="subscription.ends_at">
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">End Date</div>
                  <div>{{ formatDate(subscription.ends_at) }}</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Available Features -->
      <v-card
        variant="outlined"
        :style="{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          borderColor: 'var(--border)',
        }"
      >
        <v-card-title>Available Features</v-card-title>
        <v-card-text>
          <div v-if="loadingFeatures" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="features.length === 0" class="text-center py-8">
            <p class="text-medium-emphasis">No features available</p>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="feature in features"
              :key="feature.id"
              variant="outlined"
              :style="{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="font-weight-medium">{{ feature.name || feature.key || 'N/A' }}</div>
                    <div v-if="feature.description" class="text-caption text-medium-emphasis">
                      {{ feature.description }}
                    </div>
                    <div v-if="feature.value" class="text-caption mt-1">
                      Value: {{ feature.value }}
                    </div>
                  </div>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <!-- Subscription History -->
      <v-card
        variant="outlined"
        :style="{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          borderColor: 'var(--border)',
        }"
      >
        <v-card-title>Subscription History</v-card-title>
        <v-card-text>
          <div v-if="loadingHistory" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="history.length === 0" class="text-center py-8">
            <p class="text-medium-emphasis">No subscription history</p>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="item in history"
              :key="item.id"
              variant="outlined"
              :style="{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="font-weight-medium">{{ item.plan?.name || 'N/A' }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(item.starts_at) }} - {{ item.ends_at ? formatDate(item.ends_at) : 'Ongoing' }}
                    </div>
                  </div>
                  <v-chip
                    :color="getStatusColor(item.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ item.status || 'N/A' }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSubscription, getFeatures, getSubscriptionHistory } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const loadingFeatures = ref(false)
const loadingHistory = ref(false)
const error = ref<string | null>(null)
const subscription = ref<any>(null)
const features = ref<any[]>([])
const history = ref<any[]>([])

const loadSubscription = async () => {
  try {
    loading.value = true
    error.value = null
    const sub = await getSubscription()
    subscription.value = sub
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load subscription'
  } finally {
    loading.value = false
  }
}

const loadFeatures = async () => {
  try {
    loadingFeatures.value = true
    const featureList = await getFeatures()
    features.value = featureList
  } catch (err) {
    console.error('Failed to load features:', err)
  } finally {
    loadingFeatures.value = false
  }
}

const loadHistory = async () => {
  try {
    loadingHistory.value = true
    const historyList = await getSubscriptionHistory()
    history.value = historyList
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    loadingHistory.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    trial: 'info',
    expired: 'error',
    canceled: 'warning',
    scheduled: 'primary',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await Promise.all([loadSubscription(), loadFeatures(), loadHistory()])
})
</script>

