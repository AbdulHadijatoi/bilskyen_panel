<template>
  <div class="panel-page pa-4">
    <h1 class="text-h5 mb-4">{{ t('admin.cms.media.title') }}</h1>
    <v-file-input v-model="uploadFiles" :label="t('admin.cms.media.upload')" accept="image/*" prepend-icon="mdi-upload" class="mb-4" @update:model-value="onUpload" />
    <v-row>
      <v-col v-for="item in media" :key="item.id" cols="6" sm="4" md="3">
        <v-card variant="outlined">
          <v-img :src="item.url" height="140" cover />
          <v-card-text class="pa-2">
            <v-text-field v-model="item.alt_text" :label="t('admin.cms.media.altText')" density="compact" hide-details @blur="saveAlt(item)" />
            <v-btn size="x-small" color="error" variant="text" class="mt-1" @click="remove(item)">{{ t('common.delete') }}</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCmsMedia, uploadCmsMedia, updateCmsMedia, deleteCmsMedia } from '@/api/admin.api'

const { t } = useI18n()
const media = ref<any[]>([])
const uploadFiles = ref<File[]>([])

async function load() {
  const res = await getCmsMedia()
  media.value = Array.isArray(res) ? res : ((res as { data?: any[] }).data ?? [])
}

async function onUpload(files: File | File[] | null) {
  const list = Array.isArray(files) ? files : files ? [files] : []
  for (const file of list) {
    await uploadCmsMedia(file)
  }
  uploadFiles.value = []
  await load()
}

async function saveAlt(item: any) {
  await updateCmsMedia(item.id, item.alt_text || '')
}

async function remove(item: any) {
  await deleteCmsMedia(item.id)
  await load()
}

onMounted(load)
</script>
