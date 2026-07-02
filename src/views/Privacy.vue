<template>
  <LegalPageContent
    :title="t('footer.privacyPolicy')"
    :description="t('public.privacy.description')"
    body-key="privacy_body"
    :empty-message="t('public.privacy.empty')"
    :load-content="getPublicPrivacyContent"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LegalPageContent from '@/components/legal/LegalPageContent.vue'
import { getPublicPrivacyContent } from '@/api/public.api'

const { t } = useI18n()
</script>
