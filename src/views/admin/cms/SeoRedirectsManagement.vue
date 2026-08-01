<template>
  <div class="panel-page pa-4">
    <div class="d-flex justify-space-between mb-4">
      <h1 class="text-h5">{{ t('admin.cms.redirects.title') }}</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">{{ t('admin.cms.redirects.add') }}</v-btn>
    </div>
    <v-data-table :headers="headers" :items="redirects" :loading="loading">
      <template #item.is_active="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'default'" size="small">{{ item.is_active ? 'Active' : 'Inactive' }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon variant="text" size="small" @click="openEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn icon variant="text" size="small" color="error" @click="remove(item)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card>
        <v-card-title>{{ editing ? t('common.edit') : t('admin.cms.redirects.add') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.from_path" :label="t('admin.cms.redirects.from')" class="mb-2" />
          <v-text-field v-model="form.to_path" :label="t('admin.cms.redirects.to')" class="mb-2" />
          <v-select
            v-model="form.match_type"
            :items="matchTypeItems"
            :label="t('admin.cms.redirects.matchType')"
            class="mb-2"
          />
          <v-select v-model="form.redirect_type" :items="[301, 302]" :label="t('admin.cms.redirects.type')" class="mb-2" />
          <v-switch v-model="form.is_active" :label="t('admin.cms.redirects.active')" />
        </v-card-text>
        <v-card-actions>
          <v-spacer /><v-btn variant="text" @click="dialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" @click="save">{{ t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSeoRedirects, createSeoRedirect, updateSeoRedirect, deleteSeoRedirect } from '@/api/admin.api'

const { t } = useI18n()
const loading = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editId = ref<number | null>(null)
const redirects = ref<any[]>([])
const form = ref({ from_path: '', to_path: '', match_type: 'exact', redirect_type: 301, is_active: true })

const matchTypeItems = [
  { title: 'Exact', value: 'exact' },
  { title: 'Prefix', value: 'prefix' },
]

const headers = [
  { title: 'From', key: 'from_path' },
  { title: 'To', key: 'to_path' },
  { title: 'Match', key: 'match_type' },
  { title: 'Type', key: 'redirect_type' },
  { title: 'Hits', key: 'hit_count' },
  { title: 'Active', key: 'is_active' },
  { title: '', key: 'actions', sortable: false },
]

async function load() {
  loading.value = true
  redirects.value = (await getSeoRedirects()) as any[]
  loading.value = false
}

function openCreate() {
  editing.value = false
  editId.value = null
  form.value = { from_path: '', to_path: '', match_type: 'exact', redirect_type: 301, is_active: true }
  dialog.value = true
}

function openEdit(item: any) {
  editing.value = true
  editId.value = item.id
  form.value = { ...item }
  dialog.value = true
}

async function save() {
  if (editing.value && editId.value) await updateSeoRedirect(editId.value, form.value)
  else await createSeoRedirect(form.value)
  dialog.value = false
  await load()
}

async function remove(item: any) {
  await deleteSeoRedirect(item.id)
  await load()
}

onMounted(load)
</script>
