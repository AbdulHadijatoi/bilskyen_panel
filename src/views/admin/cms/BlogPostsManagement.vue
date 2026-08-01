<template>
  <div class="panel-page pa-4">
    <PageHeader :title="t('admin.cms.blog.title')" :subtitle="t('admin.cms.blog.subtitle')">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'admin.cms.blog.new' }">
          {{ t('admin.cms.blog.addPost') }}
        </v-btn>
      </template>
    </PageHeader>

    <div class="panel-table-card">
      <v-data-table :headers="headers" :items="posts" :loading="loading">
        <template #item.layout="{ item }">
          <span class="text-caption">{{ item.layout || 'classic' }}</span>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="item.status === 'published' ? 'success' : 'default'" variant="tonal">
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon variant="text" size="small" :to="{ name: 'admin.cms.blog.edit', params: { id: item.id } }">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click="remove(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteCmsPost, getCmsPosts } from '@/api/admin.api'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()
const loading = ref(false)
const posts = ref<any[]>([])

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Slug', key: 'slug' },
  { title: 'Layout', key: 'layout' },
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

async function remove(item: any) {
  if (!confirm(t('admin.cms.blog.confirmDelete'))) return
  await deleteCmsPost(item.id)
  await load()
}

onMounted(load)
</script>
