<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-3 flex-wrap gap-2">
      <v-text-field
        v-model="search"
        density="compact"
        variant="outlined"
        hide-details
        prepend-inner-icon="mdi-magnify"
        :placeholder="t('admin.cms.builder.searchSections')"
        style="max-width: 280px"
      />
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="catalogOpen = true">
        {{ t('admin.cms.builder.addSection') }}
      </v-btn>
    </div>

    <div v-if="!blocks.length" class="text-medium-emphasis pa-6 text-center border rounded-lg">
      {{ t('admin.cms.builder.noSections') }}
    </div>

    <div v-for="(block, idx) in blocks" :key="block.id" class="section-row mb-3">
      <div class="section-row__head">
        <div>
          <strong>{{ typeLabel(block.type) }}</strong>
          <span class="text-medium-emphasis text-caption ml-2">{{ block.variant }}</span>
        </div>
        <div class="d-flex gap-1">
          <v-btn icon size="x-small" variant="text" :disabled="idx === 0" @click="move(idx, -1)">
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" :disabled="idx === blocks.length - 1" @click="move(idx, 1)">
            <v-icon>mdi-arrow-down</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" @click="openVariant(idx)">
            <v-icon>mdi-palette-outline</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="error" @click="remove(idx)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <slot name="editor" :block="block" :index="idx" />
    </div>

    <v-dialog v-model="catalogOpen" max-width="860" scrollable>
      <v-card>
        <v-card-title>{{ t('admin.cms.builder.chooseSection') }}</v-card-title>
        <v-card-text>
          <div class="catalog-grid">
            <button
              v-for="sec in filteredTypes"
              :key="sec.type"
              type="button"
              class="catalog-card"
              @click="pickType(sec.type)"
            >
              <TemplateMiniPreview kind="section" :section-type="sec.type" :variant="sec.variants[0]?.id" :style-id="styleId" />
              <strong>{{ sec.label }}</strong>
              <span>{{ sec.description }}</span>
            </button>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="catalogOpen = false">{{ t('common.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="variantOpen" max-width="860" scrollable>
      <v-card>
        <v-card-title>{{ t('admin.cms.builder.chooseVariant') }}</v-card-title>
        <v-card-text>
          <div class="catalog-grid">
            <button
              v-for="v in activeVariants"
              :key="v.id"
              type="button"
              class="catalog-card"
              :class="{ 'catalog-card--selected': pendingVariant === v.id }"
              @click="pendingVariant = v.id"
            >
              <TemplateMiniPreview
                kind="section"
                :section-type="pendingType"
                :variant="v.id"
                :style-id="styleId"
              />
              <strong>{{ v.label }}</strong>
              <span>{{ v.description }}</span>
            </button>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="variantOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" @click="confirmVariant">{{ t('admin.cms.builder.useVariant') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CmsBlock, CmsSectionTypeDef } from '@/constants/cms'
import { createSectionBlock } from '@/constants/cms'
import TemplateMiniPreview from './TemplateMiniPreview.vue'

const props = defineProps<{
  blocks: CmsBlock[]
  sectionTypes: CmsSectionTypeDef[]
  styleId?: string
  blog?: boolean
}>()

const emit = defineEmits<{
  'update:blocks': [CmsBlock[]]
}>()

const { t } = useI18n()
const search = ref('')
const catalogOpen = ref(false)
const variantOpen = ref(false)
const pendingType = ref('')
const pendingVariant = ref('')
const editingIndex = ref<number | null>(null)
const adding = ref(false)

const filteredTypes = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.sectionTypes.filter((s) => {
    if (!q) return true
    return s.label.toLowerCase().includes(q) || s.type.includes(q) || s.description.toLowerCase().includes(q)
  })
})

const activeVariants = computed(() => {
  return props.sectionTypes.find((s) => s.type === pendingType.value)?.variants ?? []
})

function typeLabel(type: string) {
  return props.sectionTypes.find((s) => s.type === type)?.label ?? type
}

function move(idx: number, dir: number) {
  const next = [...props.blocks]
  const target = idx + dir
  if (target < 0 || target >= next.length) return
  const tmp = next[idx]
  next[idx] = next[target]
  next[target] = tmp
  emit('update:blocks', next)
}

function remove(idx: number) {
  const next = props.blocks.filter((_, i) => i !== idx)
  emit('update:blocks', next)
}

function pickType(type: string) {
  pendingType.value = type
  pendingVariant.value = props.sectionTypes.find((s) => s.type === type)?.variants[0]?.id ?? 'default'
  adding.value = true
  editingIndex.value = null
  catalogOpen.value = false
  variantOpen.value = true
}

function openVariant(idx: number) {
  const block = props.blocks[idx]
  pendingType.value = block.type
  pendingVariant.value = block.variant
  editingIndex.value = idx
  adding.value = false
  variantOpen.value = true
}

function confirmVariant() {
  if (adding.value) {
    const block = createSectionBlock(pendingType.value, pendingVariant.value, props.blog)
    emit('update:blocks', [...props.blocks, block])
  } else if (editingIndex.value !== null) {
    const next = props.blocks.map((b, i) =>
      i === editingIndex.value ? { ...b, variant: pendingVariant.value } : b,
    )
    emit('update:blocks', next)
  }
  variantOpen.value = false
}
</script>

<style scoped>
.section-row {
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 12px;
  background: var(--card, #fff);
}
.section-row__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.catalog-card {
  text-align: left;
  border: 2px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 10px;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.catalog-card strong { font-size: 13px; }
.catalog-card span { font-size: 11px; color: #6b7280; line-height: 1.35; }
.catalog-card--selected {
  border-color: var(--primary, #03418b);
}
</style>
