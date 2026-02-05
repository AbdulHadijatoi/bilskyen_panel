<template>
  <div class="analytics-sidebar">
    <!-- Header -->
    <div class="analytics-header">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary">mdi-chart-box</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Analytics</span>
      </div>
      <v-btn
        icon
        variant="text"
        size="small"
        density="compact"
        @click="$emit('toggle')"
      >
        <v-icon size="small">mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Content -->
    <div class="analytics-content">
      <!-- Total Leads Card -->
      <div class="metric-card primary-card">
        <div class="metric-icon">
          <v-icon size="24">mdi-account-group</v-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ totalLeads }}</div>
          <div class="metric-label">Total Leads</div>
        </div>
      </div>

      <!-- By Stage -->
      <div class="analytics-section">
        <div class="section-header">
          <v-icon size="16" class="mr-1">mdi-filter</v-icon>
          <span class="text-caption font-weight-medium">By Stage</span>
        </div>
        <div class="section-content">
          <div
            v-for="(count, stageId) in leadsByStage"
            :key="stageId"
            class="metric-row"
          >
            <div class="d-flex align-center gap-2 flex-grow-1">
              <div
                class="stage-indicator"
                :style="{ backgroundColor: getStageColor(Number(stageId)) }"
              />
              <span class="metric-name">{{ getStageName(Number(stageId)) }}</span>
            </div>
            <div class="metric-count">{{ count }}</div>
          </div>
          <div v-if="Object.keys(leadsByStage).length === 0" class="empty-state">
            <v-icon size="20" class="mb-1">mdi-information-outline</v-icon>
            <span class="text-caption text-medium-emphasis">No data</span>
          </div>
        </div>
      </div>

      <!-- By Intent -->
      <div class="analytics-section">
        <div class="section-header">
          <v-icon size="16" class="mr-1">mdi-star</v-icon>
          <span class="text-caption font-weight-medium">By Intent</span>
        </div>
        <div class="section-content">
          <div
            v-for="(count, intentId) in leadsByIntent"
            :key="intentId"
            class="metric-row"
          >
            <div class="d-flex align-center gap-2 flex-grow-1">
              <div
                class="intent-indicator"
                :style="{ backgroundColor: getIntentColor(Number(intentId)) }"
              />
              <span class="metric-name">{{ getIntentName(Number(intentId)) }}</span>
            </div>
            <div class="metric-count">{{ count }}</div>
          </div>
          <div v-if="Object.keys(leadsByIntent).length === 0" class="empty-state">
            <v-icon size="20" class="mb-1">mdi-information-outline</v-icon>
            <span class="text-caption text-medium-emphasis">No data</span>
          </div>
        </div>
      </div>

      <!-- Top Vehicles -->
      <div class="analytics-section">
        <div class="section-header">
          <v-icon size="16" class="mr-1">mdi-car</v-icon>
          <span class="text-caption font-weight-medium">Top Vehicles</span>
        </div>
        <div class="section-content">
          <div
            v-for="item in topVehicles"
            :key="item.vehicle?.id || Math.random()"
            class="metric-row"
          >
            <div class="d-flex align-center gap-2 flex-grow-1 min-width-0">
              <v-icon size="16" class="text-medium-emphasis">mdi-car-outline</v-icon>
              <span class="metric-name text-truncate">
                {{ item.vehicle?.title || item.vehicle?.registration || 'N/A' }}
              </span>
            </div>
            <div class="metric-count">{{ item.count }}</div>
          </div>
          <div v-if="topVehicles.length === 0" class="empty-state">
            <v-icon size="20" class="mb-1">mdi-information-outline</v-icon>
            <span class="text-caption text-medium-emphasis">No vehicle data</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LeadModel } from '@/models/lead.model'
import {
  getStageName,
  getStageColor,
  getIntentName,
  getIntentColor,
} from '@/utils/leadHelpers'

const props = defineProps<{
  leads: LeadModel[]
  loading?: boolean
}>()

defineEmits<{
  toggle: []
}>()

const totalLeads = computed(() => props.leads.length)

const leadsByStage = computed(() => {
  const counts: Record<number, number> = {}
  props.leads.forEach(lead => {
    counts[lead.stageId] = (counts[lead.stageId] || 0) + 1
  })
  return counts
})

const leadsByIntent = computed(() => {
  const counts: Record<number, number> = {}
  props.leads.forEach(lead => {
    if (lead.intentId) {
      counts[lead.intentId] = (counts[lead.intentId] || 0) + 1
    }
  })
  return counts
})

const topVehicles = computed(() => {
  const vehicleCounts: Record<number, { vehicle: any, count: number }> = {}
  props.leads.forEach(lead => {
    if (lead.vehicleId) {
      const vehicleId = lead.vehicleId
      if (!vehicleCounts[vehicleId]) {
        vehicleCounts[vehicleId] = {
          vehicle: lead.vehicle || null,
          count: 0,
        }
      }
      const countEntry = vehicleCounts[vehicleId]
      if (countEntry) {
        countEntry.count++
      }
    }
  })
  return Object.values(vehicleCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .filter(item => item.vehicle !== null && item.vehicle !== undefined)
})
</script>

<style scoped>
.analytics-sidebar {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 200px);
  overflow: hidden;
}

.analytics-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.analytics-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Metric Card */
.metric-card {
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.metric-card.primary-card {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, var(--primary)) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-top: 2px;
}

/* Analytics Section */
.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  color: var(--foreground);
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Metric Row */
.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  gap: 8px;
}

.metric-name {
  font-size: 0.8125rem;
  color: var(--foreground);
  flex: 1;
  min-width: 0;
}

.metric-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
  flex-shrink: 0;
}

/* Indicators */
.stage-indicator,
.intent-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  color: var(--muted-foreground);
}

/* Responsive */
@media (max-width: 960px) {
  .analytics-sidebar {
    max-height: none;
  }
  
  .analytics-content {
    padding: 12px;
    gap: 12px;
  }
  
  .metric-card {
    padding: 12px;
  }
}
</style>
