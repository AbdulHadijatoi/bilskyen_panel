<template>
  <v-card
    variant="outlined"
    class="lead-card mb-2"
    :style="{
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)',
    }"
    @click="handleCardClick"
  >
    <v-card-text class="pa-3">
      <div class="d-flex justify-space-between align-start mb-2">
        <div class="flex-grow-1">
          <div class="font-weight-bold mb-1">{{ lead.name || 'Unknown' }}</div>
          <div class="text-caption text-medium-emphasis mb-2">
            {{ lead.email || lead.phone || 'No contact' }}
          </div>
        </div>
        <v-menu location="bottom end" @click.stop>
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              variant="text"
              size="small"
              v-bind="menuProps"
              @click.stop
            >
              <v-icon size="small">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="$emit('view', lead.id)">
              <v-list-item-title>View Details</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('assign', lead)">
              <v-list-item-title>Assign</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('change-intent', lead)">
              <v-list-item-title>Change Intent</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('change-category', lead)">
              <v-list-item-title>Change Category</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      
      <div v-if="lead.vehicle" class="text-caption text-medium-emphasis mb-2">
        <v-icon size="small" class="mr-1">mdi-car</v-icon>
        {{ lead.vehicle.title || lead.vehicle.registration || 'N/A' }}
      </div>
      
      <div class="d-flex gap-1 flex-wrap mb-2">
        <v-chip
          v-if="lead.intentId"
          size="x-small"
          variant="flat"
          :color="getIntentColor(lead.intentId)"
        >
          {{ getIntentName(lead.intentId) }}
        </v-chip>
        <v-chip
          v-if="lead.categoryId"
          size="x-small"
          variant="outlined"
        >
          {{ getCategoryName(lead.categoryId) }}
        </v-chip>
      </div>
      
      <div class="text-caption text-medium-emphasis">
        {{ formatLeadDate(lead.createdAt) }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { LeadModel } from '@/models/lead.model'
import {
  getIntentName,
  getIntentColor,
  getCategoryName,
  formatLeadDate,
} from '@/utils/leadHelpers'

const props = defineProps<{
  lead: LeadModel
}>()

const emit = defineEmits<{
  view: [id: number]
  assign: [lead: LeadModel]
  'change-intent': [lead: LeadModel]
  'change-category': [lead: LeadModel]
}>()

// Simple click handler - let SortableJS handle drag detection
const handleCardClick = (event: MouseEvent) => {
  // Check if this was triggered during a drag operation
  // SortableJS adds classes during drag, so we can check for those
  const isDragging = (event.target as HTMLElement).closest('.sortable-ghost') !== null ||
                     (event.target as HTMLElement).closest('.sortable-chosen') !== null
  
  if (!isDragging) {
    emit('view', props.lead.id)
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.lead-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  cursor: grab;
  position: relative;
}

.lead-card:active {
  cursor: grabbing;
}

.lead-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: var(--primary);
}

.lead-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.lead-card:hover::before {
  opacity: 1;
}

/* Chip animations */
:deep(.v-chip) {
  transition: all 0.2s ease;
}

:deep(.v-chip:hover) {
  transform: scale(1.05);
}
</style>
