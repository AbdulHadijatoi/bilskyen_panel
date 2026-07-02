<template>
  <LegalPageContent
    :title="t('footer.termsOfService')"
    :description="t('public.terms.description')"
    body-key="terms_body"
    :empty-message="t('public.terms.empty')"
    :load-content="getPublicTermsContent"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LegalPageContent from '@/components/legal/LegalPageContent.vue'
import { getPublicTermsContent } from '@/api/public.api'

const { t } = useI18n()
</script>
