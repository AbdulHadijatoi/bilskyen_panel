<template>
  <div class="constant-list">
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-4">Loading...</p>
    </div>

    <div v-else-if="error" class="error-container pa-6">
      <v-alert type="error" variant="tonal" prominent>{{ error }}</v-alert>
    </div>

    <div v-else-if="filteredItems.length === 0" class="panel-table-empty">
      <v-icon size="48" color="disabled">mdi-inbox-outline</v-icon>
      <p>{{ searchQuery ? 'No results found' : `No ${title.toLowerCase()} yet` }}</p>
    </div>

    <div
      v-else
      class="panel-constant-table"
      :class="{
        'panel-constant-table--meta': showMetaColumn,
        'panel-constant-table--variant': showVariantBrandModel,
      }"
    >
      <div class="panel-constant-table__header">
        <div class="panel-constant-table__cell panel-constant-table__cell--name">Name</div>
        <template v-if="showVariantBrandModel">
          <div class="panel-constant-table__cell">Brand</div>
          <div class="panel-constant-table__cell">Model</div>
        </template>
        <div v-else-if="showBrand || showEquipmentType || showModel" class="panel-constant-table__cell">
          <template v-if="showBrand">Brand</template>
          <template v-else-if="showEquipmentType">Type</template>
          <template v-else-if="showModel">Model</template>
        </div>
        <div class="panel-constant-table__cell panel-constant-table__cell--actions">Actions</div>
      </div>
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="panel-constant-table__row"
      >
        <div class="panel-constant-table__cell panel-constant-table__cell--name text-truncate">
          {{ item.name }}
        </div>
        <template v-if="showVariantBrandModel">
          <div class="panel-constant-table__cell text-truncate">
            {{
              'model' in item && item.model?.brand?.name
                ? item.model.brand.name
                : '—'
            }}
          </div>
          <div class="panel-constant-table__cell text-truncate">
            {{ 'model' in item && item.model?.name ? item.model.name : '—' }}
          </div>
        </template>
        <div
          v-else-if="showBrand || showEquipmentType || showModel"
          class="panel-constant-table__cell text-truncate"
        >
          <template v-if="showBrand && 'brand' in item && item.brand">
            {{ item.brand.name }}
          </template>
          <template v-else-if="showEquipmentType && 'equipment_type' in item && item.equipment_type">
            {{ item.equipment_type.name }}
          </template>
          <template v-else-if="showModel && 'model' in item && item.model">
            {{ item.model.name }}
          </template>
          <span v-else class="panel-constant-table__muted">—</span>
        </div>
        <div class="panel-constant-table__cell panel-constant-table__cell--actions">
          <button
            type="button"
            class="panel-icon-btn panel-icon-btn--primary"
            title="Edit"
            @click="$emit('edit', item)"
          >
            <v-icon size="16">mdi-pencil-outline</v-icon>
          </button>
          <button
            type="button"
            class="panel-icon-btn panel-icon-btn--danger"
            title="Delete"
            @click="$emit('delete', item.id)"
          >
            <v-icon size="16">mdi-trash-can-outline</v-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConstantModel, VehicleModelConstant, EquipmentConstant, VariantConstant } from '@/api/admin.api'

interface Props {
  items: (ConstantModel | VehicleModelConstant | EquipmentConstant | VariantConstant)[]
  loading?: boolean
  error?: string | null
  title: string
  searchQuery?: string
  showBrand?: boolean
  showEquipmentType?: boolean
  showModel?: boolean
  showVariantBrandModel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  searchQuery: '',
  showBrand: false,
  showEquipmentType: false,
  showModel: false,
  showVariantBrandModel: false,
})

const showMetaColumn = computed(
  () =>
    props.showVariantBrandModel ||
    props.showBrand ||
    props.showEquipmentType ||
    props.showModel,
)

defineEmits<{
  edit: [item: ConstantModel | VehicleModelConstant | EquipmentConstant | VariantConstant]
  delete: [id: number]
}>()

const filteredItems = computed(() => {
  if (!props.searchQuery) {
    return props.items
  }
  const query = props.searchQuery.toLowerCase()
  return props.items.filter((item) => {
    if (item.name.toLowerCase().includes(query)) return true
    if (props.showVariantBrandModel && 'model' in item) {
      const m = item.model
      if (m?.name?.toLowerCase().includes(query)) return true
      if (m?.brand?.name?.toLowerCase().includes(query)) return true
    }
    if (props.showBrand && 'brand' in item && item.brand?.name.toLowerCase().includes(query)) return true
    if (
      props.showEquipmentType &&
      'equipment_type' in item &&
      item.equipment_type?.name.toLowerCase().includes(query)
    )
      return true
    if (props.showModel && 'model' in item && item.model?.name.toLowerCase().includes(query)) return true
    return false
  })
})
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}
</style>
