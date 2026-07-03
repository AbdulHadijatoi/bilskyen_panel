<template>
  <div class="panel-page pa-4">
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
      <div>
        <h1 class="text-h5">{{ t('admin.cms.blog.title') }}</h1>
        <p class="text-medium-emphasis">{{ t('admin.cms.blog.subtitle') }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">{{ t('admin.cms.blog.addPost') }}</v-btn>
    </div>

    <v-data-table :headers="headers" :items="posts" :loading="loading" class="elevation-1">
      <template #item.status="{ item }">
        <v-chip size="small" :color="item.status === 'published' ? 'success' : 'default'">{{ item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon variant="text" size="small" @click="openEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn icon variant="text" size="small" color="error" @click="remove(item)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="800" persistent scrollable>
      <v-card>
        <v-card-title>{{ editing ? t('common.edit') : t('admin.cms.blog.addPost') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" :label="t('admin.cms.blog.postTitle')" class="mb-2" />
          <v-text-field v-model="form.slug" :label="t('admin.cms.blog.slug')" class="mb-2" />
          <v-select v-model="form.status" :items="statusOptions" :label="t('admin.cms.blog.status')" class="mb-2" />
          <v-textarea v-model="form.excerpt" :label="t('admin.cms.blog.excerpt')" rows="2" class="mb-2" />
          <div class="d-flex justify-end mb-1">
            <AiGenerateButton
              mode="admin"
              task="cms_rewrite"
              :context="{ title: form.title, excerpt: form.excerpt, content: form.content_html }"
              :label="t('dealer.views.ai.rewriteCopy')"
              auto-generate
              :show-tone-selector="false"
              @accept="form.content_html = $event"
            />
          </div>
          <v-textarea v-model="form.content_html" :label="t('admin.cms.blog.content')" rows="8" class="mb-2" />
          <v-text-field v-model="form.meta_title" :label="t('admin.seoContent.metaTitle')" class="mb-2" />
          <v-textarea v-model="form.meta_description" :label="t('admin.seoContent.metaDescription')" rows="2" />
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
import { getCmsPosts, createCmsPost, updateCmsPost, deleteCmsPost } from '@/api/admin.api'
import AiGenerateButton from '@/components/ai/AiGenerateButton.vue'

const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editId = ref<number | null>(null)
const posts = ref<any[]>([])

const form = ref({
  title: '',
  slug: '',
  status: 'draft',
  excerpt: '',
  content_html: '',
  meta_title: '',
  meta_description: '',
})

const statusOptions = ['draft', 'scheduled', 'published']

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Slug', key: 'slug' },
  { title: 'Status', key: 'status' },
  { title: 'Updated', key: 'updated_at' },
  { title: '', key: 'actions', sortable: false },
]

async function load() {
  loading.value = true
  try {
    posts.value = (await getCmsPosts()) as any[]
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  editId.value = null
  form.value = { title: '', slug: '', status: 'draft', excerpt: '', content_html: '', meta_title: '', meta_description: '' }
  dialog.value = true
}

function openEdit(item: any) {
  editing.value = true
  editId.value = item.id
  form.value = { ...item }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value && editId.value) {
      await updateCmsPost(editId.value, form.value)
    } else {
      await createCmsPost(form.value)
    }
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(item: any) {
  if (!confirm(t('admin.cms.blog.confirmDelete'))) return
  await deleteCmsPost(item.id)
  await load()
}

onMounted(load)
</script>
