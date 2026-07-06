<template>
  <div
    class="auth-layout"
    :class="{ 'auth-layout--centered': !showSidebar }"
  >
    <div v-if="showSidebar" class="auth-layout-left">
      <div class="auth-layout-left-header">
        <router-link to="/" class="auth-logo-link">
          <img src="/images/logo.png" alt="Bilskyen" class="auth-logo" />
        </router-link>
        <LanguageSwitcher />
      </div>
      <div class="auth-layout-left-content">
        <blockquote class="auth-testimonial">
          <p class="auth-testimonial-text">
            &ldquo;{{ APP.NAME }} {{ BRANDING.AUTH_TESTIMONIAL }}&rdquo;
          </p>
          <footer class="auth-testimonial-author">
            {{ BRANDING.AUTH_TESTIMONIAL_AUTHOR }}
          </footer>
        </blockquote>
      </div>
    </div>
    <div class="auth-layout-right">
      <div class="auth-layout-right-header">
        <router-link to="/" class="auth-logo-link-mobile">
          <img src="/images/logo.png" alt="Bilskyen" class="auth-logo-mobile" />
        </router-link>
        <LanguageSwitcher />
      </div>
      <slot />
      <nav class="auth-marketing-links" aria-label="Marketing">
        <a :href="`${APP.MARKETPLACE_URL}/for-dealers/pricing`">{{ t('auth.marketing.pricing') }}</a>
        <a :href="`${APP.MARKETPLACE_URL}/for-dealers`">{{ t('auth.marketing.forDealers') }}</a>
        <a :href="`${APP.MARKETPLACE_URL}/for-staff`">{{ t('auth.marketing.forStaff') }}</a>
        <a :href="`${APP.MARKETPLACE_URL}/privacy-policy`">{{ t('auth.marketing.privacy') }}</a>
        <a :href="`${APP.MARKETPLACE_URL}/terms-of-service`">{{ t('auth.marketing.terms') }}</a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { APP } from '@/constants/app'
import { BRANDING } from '@/constants/branding'
import { useThemeStore } from '@/stores/theme'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher.vue'

const { t } = useI18n()

withDefaults(
  defineProps<{
    showSidebar?: boolean
  }>(),
  {
    showSidebar: true,
  },
)

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

onMounted(() => {
  if (!vuetifyTheme) return
  themeStore.setVuetifyTheme(vuetifyTheme)
})
</script>
