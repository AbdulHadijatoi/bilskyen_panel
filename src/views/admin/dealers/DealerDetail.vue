<template>
  <div class="panel-page">
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="dealer">
      <PageHeader
        :title="dealer.owner?.name || dealer.slug"
        :subtitle="`${dealer.cvr} · ${dealer.city}`"
        show-back
        :back-to="{ name: 'admin.dealers' }"
      />

      <v-row>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.vehicles') }}</v-card-title>
            <v-card-text class="text-h5">{{ dealer.vehicles?.length ?? 0 }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.staff') }}</v-card-title>
            <v-card-text class="text-h5">{{ dealer.staff?.length ?? 0 }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>{{ t('admin.views.dealers.subscriptions') }}</v-card-title>
            <v-card-text class="text-h5">{{ dealer.subscriptions?.length ?? 0 }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getDealerDetailRaw } from '@/api/admin.api'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()
const route = useRoute()
const dealer = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    dealer.value = await getDealerDetailRaw(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
