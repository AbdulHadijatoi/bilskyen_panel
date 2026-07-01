<template>
  <div class="pa-4">
    <h1 class="text-h5 mb-2">{{ t('admin.cms.seoTools.title') }}</h1>
    <p class="text-medium-emphasis mb-4">{{ t('admin.cms.seoTools.subtitle') }}</p>

    <v-tabs v-model="tab" class="mb-4">
      <v-tab value="robots">{{ t('admin.cms.seoTools.robots') }}</v-tab>
      <v-tab value="audit">{{ t('admin.cms.seoTools.audit') }}</v-tab>
      <v-tab value="cookie">{{ t('admin.cms.seoTools.cookie') }}</v-tab>
      <v-tab value="schema">{{ t('admin.cms.seoTools.schema') }}</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="robots">
        <v-select v-model="robots.mode" :items="['default', 'custom']" :label="t('admin.cms.seoTools.robotsMode')" class="mb-2" />
        <v-textarea v-model="robots.custom_body" :label="t('admin.cms.seoTools.robotsCustom')" rows="10" class="mb-2 font-monospace" />
        <v-btn color="primary" :loading="savingRobots" @click="saveRobots">{{ t('common.save') }}</v-btn>
        <v-card v-if="robots.preview" variant="tonal" class="mt-4 pa-3">
          <pre class="text-caption">{{ robots.preview }}</pre>
        </v-card>
      </v-window-item>

      <v-window-item value="audit">
        <v-btn color="primary" :loading="auditing" class="mb-4" @click="runAudit">{{ t('admin.cms.seoTools.runAudit') }}</v-btn>
        <v-row v-if="audit?.summary" class="mb-4">
          <v-col cols="3"><v-chip>Total: {{ audit.summary.total }}</v-chip></v-col>
          <v-col cols="3"><v-chip color="error">Errors: {{ audit.summary.error }}</v-chip></v-col>
          <v-col cols="3"><v-chip color="warning">Warnings: {{ audit.summary.warning }}</v-chip></v-col>
        </v-row>
        <v-list v-if="audit?.issues?.length">
          <v-list-item v-for="(issue, i) in audit.issues" :key="i">
            <v-list-item-title>
              <v-chip :color="issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'default'" size="x-small" class="mr-2">{{ issue.severity }}</v-chip>
              {{ issue.message }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ issue.reference }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-window-item>

      <v-window-item value="cookie">
        <v-switch v-model="cookie.enabled" :label="t('admin.cms.seoTools.cookieEnabled')" class="mb-2" />
        <v-textarea v-model="cookie.text_en" :label="t('admin.cms.seoTools.cookieTextEn')" rows="3" class="mb-2" />
        <v-textarea v-model="cookie.text_da" :label="t('admin.cms.seoTools.cookieTextDa')" rows="3" class="mb-2" />
        <v-btn color="primary" :loading="savingCookie" @click="saveCookie">{{ t('common.save') }}</v-btn>
      </v-window-item>

      <v-window-item value="schema">
        <v-select v-model="schemaType" :items="presets" item-title="label" item-value="value" :label="t('admin.seoContent.schemaType')" class="mb-2" />
        <v-textarea v-model="schemaFieldsJson" :label="t('admin.cms.seoTools.schemaFields')" rows="6" class="mb-2 font-monospace" />
        <v-btn color="primary" class="mb-4" @click="buildSchema">{{ t('admin.cms.seoTools.buildSchema') }}</v-btn>
        <v-textarea v-if="schemaOutput" v-model="schemaOutput" label="JSON-LD" rows="10" readonly class="font-monospace" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getSeoRobotsSettings,
  updateSeoRobotsSettings,
  getCookieConsentSettings,
  updateCookieConsentSettings,
  runSeoAudit,
  getSchemaPresets,
  buildSchemaJson,
} from '@/api/admin.api'

const { t } = useI18n()
const tab = ref('robots')
const robots = ref<any>({ mode: 'default', custom_body: '', preview: '' })
const cookie = ref<any>({ enabled: false, text_en: '', text_da: '' })
const audit = ref<any>(null)
const presets = ref<any[]>([])
const schemaType = ref('LocalBusiness')
const schemaFieldsJson = ref('{"name":"Bilskyen","url":"https://bilskyen.dk"}')
const schemaOutput = ref('')
const savingRobots = ref(false)
const savingCookie = ref(false)
const auditing = ref(false)

async function load() {
  robots.value = await getSeoRobotsSettings()
  cookie.value = await getCookieConsentSettings()
  presets.value = await getSchemaPresets()
}

async function saveRobots() {
  savingRobots.value = true
  try {
    const res = await updateSeoRobotsSettings({ mode: robots.value.mode, custom_body: robots.value.custom_body })
    robots.value.preview = res.preview
  } finally {
    savingRobots.value = false
  }
}

async function saveCookie() {
  savingCookie.value = true
  try {
    await updateCookieConsentSettings(cookie.value)
  } finally {
    savingCookie.value = false
  }
}

async function runAudit() {
  auditing.value = true
  try {
    audit.value = await runSeoAudit()
  } finally {
    auditing.value = false
  }
}

async function buildSchema() {
  const fields = JSON.parse(schemaFieldsJson.value || '{}')
  const result = await buildSchemaJson(schemaType.value, fields)
  schemaOutput.value = JSON.stringify(result, null, 2)
}

onMounted(load)
</script>
