<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
      <div>
        <h1 class="text-h5">{{ t('admin.cms.landing.title') }}</h1>
        <p class="text-medium-emphasis">{{ t('admin.cms.landing.subtitle') }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">{{ t('admin.cms.landing.addPage') }}</v-btn>
    </div>

    <v-data-table :headers="headers" :items="pages" :loading="loading">
      <template #item.actions="{ item }">
        <v-btn icon variant="text" size="small" @click="openEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn icon variant="text" size="small" color="error" @click="remove(item)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="900" persistent scrollable>
      <v-card>
        <v-card-title>{{ editing ? t('common.edit') : t('admin.cms.landing.addPage') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" :label="t('admin.cms.landing.pageTitle')" class="mb-2" />
          <v-text-field v-model="form.slug" :label="t('admin.cms.landing.slug')" hint="/lp/{slug}" persistent-hint class="mb-2" />
          <v-select v-model="form.status" :items="['draft','scheduled','published']" :label="t('admin.cms.blog.status')" class="mb-4" />
          <div class="d-flex gap-2 mb-4 flex-wrap">
            <v-btn size="small" variant="outlined" @click="addBlock('hero')">+ Hero</v-btn>
            <v-btn size="small" variant="outlined" @click="addBlock('richtext')">+ Rich text</v-btn>
            <v-btn size="small" variant="outlined" @click="addBlock('cta')">+ CTA</v-btn>
            <v-btn size="small" variant="outlined" @click="addBlock('vehicle_grid')">+ Vehicles</v-btn>
            <v-btn size="small" variant="outlined" @click="addBlock('faq')">+ FAQ</v-btn>
          </div>
          <v-card v-for="(block, idx) in form.blocks" :key="idx" variant="outlined" class="mb-3 pa-3">
            <div class="d-flex justify-space-between mb-2">
              <strong>{{ block.type }}</strong>
              <v-btn icon size="x-small" variant="text" color="error" @click="form.blocks.splice(idx, 1)"><v-icon>mdi-close</v-icon></v-btn>
            </div>
            <template v-if="block.type === 'hero'">
              <v-text-field v-model="block.headline" label="Headline" density="compact" class="mb-1" />
              <v-text-field v-model="block.subheadline" label="Subheadline" density="compact" class="mb-1" />
              <v-text-field v-model="block.cta_text" label="CTA text" density="compact" class="mb-1" />
              <v-text-field v-model="block.cta_url" label="CTA URL" density="compact" />
            </template>
            <template v-else-if="block.type === 'richtext'">
              <v-textarea v-model="block.html" label="HTML" rows="4" />
            </template>
            <template v-else-if="block.type === 'cta'">
              <v-text-field v-model="block.title" label="Title" density="compact" class="mb-1" />
              <v-text-field v-model="block.button_text" label="Button text" density="compact" class="mb-1" />
              <v-text-field v-model="block.button_url" label="Button URL" density="compact" />
            </template>
            <template v-else-if="block.type === 'vehicle_grid'">
              <v-text-field v-model="block.title" label="Section title" density="compact" class="mb-1" />
              <v-text-field v-model.number="block.limit" label="Limit" type="number" density="compact" />
            </template>
            <template v-else-if="block.type === 'faq'">
              <v-text-field v-model="block.title" label="Section title" density="compact" class="mb-2" />
              <div v-for="(item, fi) in block.items" :key="fi" class="mb-2">
                <v-text-field v-model="item.question" label="Question" density="compact" class="mb-1" />
                <v-textarea v-model="item.answer" label="Answer" rows="2" density="compact" />
              </div>
              <v-btn size="small" @click="block.items.push({ question: '', answer: '' })">+ FAQ item</v-btn>
            </template>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">{{ t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLandingPages, createLandingPage, updateLandingPage, deleteLandingPage } from '@/api/admin.api'

const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editId = ref<number | null>(null)
const pages = ref<any[]>([])

const form = ref<any>({ title: '', slug: '', status: 'draft', blocks: [] })

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Slug', key: 'slug' },
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', sortable: false },
]

function addBlock(type: string) {
  const defaults: Record<string, any> = {
    hero: { type: 'hero', headline: '', subheadline: '', cta_text: '', cta_url: '' },
    richtext: { type: 'richtext', html: '' },
    cta: { type: 'cta', title: '', button_text: '', button_url: '' },
    vehicle_grid: { type: 'vehicle_grid', title: '', limit: 6 },
    faq: { type: 'faq', title: '', items: [{ question: '', answer: '' }] },
  }
  form.value.blocks.push({ ...defaults[type] })
}

async function load() {
  loading.value = true
  try {
    pages.value = (await getLandingPages()) as any[]
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  editId.value = null
  form.value = { title: '', slug: '', status: 'draft', blocks: [] }
  dialog.value = true
}

function openEdit(item: any) {
  editing.value = true
  editId.value = item.id
  form.value = { ...item, blocks: [...(item.blocks || [])] }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value && editId.value) await updateLandingPage(editId.value, form.value)
    else await createLandingPage(form.value)
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(item: any) {
  if (!confirm(t('admin.cms.landing.confirmDelete'))) return
  await deleteLandingPage(item.id)
  await load()
}

onMounted(load)
</script>
