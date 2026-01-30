<template>
  <div class="constant-list">
    <!-- Loading State -->
    <div v-if="loading" class="list-state">
      <v-progress-circular indeterminate color="primary" size="32" />
      <p class="state-text">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="list-state error">
      <v-icon size="48" color="error">mdi-alert-circle</v-icon>
      <p class="state-text">{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="list-state empty">
      <v-icon size="48" class="empty-icon">mdi-inbox-outline</v-icon>
      <p class="state-text">
        {{ searchQuery ? 'No results found' : `No ${title.toLowerCase()} yet` }}
      </p>
      <p v-if="searchQuery" class="state-subtext">Try adjusting your search terms</p>
    </div>

    <!-- List Items -->
    <div v-else class="list-table" :class="{ 'has-meta': showBrand || showEquipmentType }">
      <div class="table-header">
        <div class="table-cell name-cell">Name</div>
        <div v-if="showBrand || showEquipmentType" class="table-cell meta-cell">
          {{ showBrand ? 'Brand' : 'Type' }}
        </div>
        <div class="table-cell actions-cell">Actions</div>
      </div>
      <div class="table-body">
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          :class="['table-row', { 'row-even': index % 2 === 1, 'row-odd': index % 2 === 0 }]"
        >
          <div class="table-cell name-cell">
            <span class="cell-content">{{ item.name }}</span>
          </div>
          <div v-if="showBrand || showEquipmentType" class="table-cell meta-cell">
            <span class="cell-content">
              <template v-if="showBrand && 'brand' in item && item.brand">
                {{ item.brand.name }}
              </template>
              <template v-else-if="showEquipmentType && 'equipment_type' in item && item.equipment_type">
                {{ item.equipment_type.name }}
              </template>
              <template v-else>
                <span class="text-muted">—</span>
              </template>
            </span>
          </div>
          <div class="table-cell actions-cell">
            <div class="cell-content actions-wrapper">
              <button
                class="action-button edit"
                @click="$emit('edit', item)"
                title="Edit"
              >
                <v-icon size="18">mdi-pencil</v-icon>
              </button>
              <button
                class="action-button delete"
                @click="$emit('delete', item.id)"
                title="Delete"
              >
                <v-icon size="18">mdi-delete-outline</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConstantModel, VehicleModelConstant, EquipmentConstant } from '@/api/admin.api'

interface Props {
  items: (ConstantModel | VehicleModelConstant | EquipmentConstant)[]
  loading?: boolean
  error?: string | null
  title: string
  searchQuery?: string
  showBrand?: boolean
  showEquipmentType?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  searchQuery: '',
  showBrand: false,
  showEquipmentType: false,
})

defineEmits<{
  edit: [item: ConstantModel | VehicleModelConstant | EquipmentConstant]
  delete: [id: number]
}>()

const filteredItems = computed(() => {
  if (!props.searchQuery) {
    return props.items
  }
  const query = props.searchQuery.toLowerCase()
  return props.items.filter(item => 
    item.name.toLowerCase().includes(query) ||
    (props.showBrand && 'brand' in item && item.brand?.name.toLowerCase().includes(query)) ||
    (props.showEquipmentType && 'equipment_type' in item && item.equipment_type?.name.toLowerCase().includes(query))
  )
})
</script>

<style scoped>
.constant-list {
  width: 100%;
}

/* State Messages */
.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;
}

.state-text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  font-weight: 500;
}

.state-subtext {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}

.empty-icon {
  color: rgba(var(--v-theme-on-surface), 0.3);
}

.list-state.error .state-text {
  color: rgb(var(--v-theme-error));
}

/* Table List */
.list-table {
  width: 100%;
  border: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--background);
}

.list-table:not(.has-meta) .table-header,
.list-table:not(.has-meta) .table-row {
  grid-template-columns: 1fr 120px;
}

.list-table.has-meta .table-header,
.list-table.has-meta .table-row {
  grid-template-columns: 1fr 200px 120px;
}

.table-header {
  display: grid;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-body .table-row {
  display: grid;
  border-bottom: 1px solid rgba(var(--v-border-opacity), 0.5);
  transition: all 0.2s ease;
  background: transparent;
}

.table-body .table-row:nth-child(odd),
.table-body .table-row.row-odd {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.table-body .table-row:nth-child(even),
.table-body .table-row.row-even {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.table-body .table-row:last-child {
  border-bottom: none;
}

.table-body .table-row:hover {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

.table-cell {
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  min-width: 0;
}

.table-header .table-cell {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.7);
  padding: 0.625rem 1rem;
}

.name-cell {
  font-weight: 500;
}

.meta-cell {
  justify-content: flex-start;
}

.actions-cell {
  justify-content: flex-end;
}

.cell-content {
  font-size: 0.875rem;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-muted {
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.actions-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.action-button:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: var(--foreground);
}

.action-button.edit:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.action-button.delete:hover {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.1);
}

.action-button:active {
  transform: scale(0.95);
}
</style>
