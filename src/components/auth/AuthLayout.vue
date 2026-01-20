<template>
  <div
    class="auth-layout"
    :style="{
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
    }"
  >
    <div class="auth-layout-left">
      <div class="auth-layout-left-header">
        <router-link to="/" class="auth-logo-link">
          <img
            src="/images/logo.png"
            alt="Bilskyen"
            class="auth-logo"
          />
        </router-link>
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
          <img
            src="/images/logo.png"
            alt="Bilskyen"
            class="auth-logo-mobile"
          />
        </router-link>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { APP } from '@/constants/app'
import { BRANDING } from '@/constants/branding'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

onMounted(() => {
  // Set Vuetify theme instance in the store if not already set
  if (!vuetifyTheme) return
  themeStore.setVuetifyTheme(vuetifyTheme)
})
</script>

<style scoped>
.auth-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

@media (min-width: 768px) {
  .auth-layout {
    display: grid;
    grid-template-columns: 1fr;
    max-width: 100%;
  }
}

@media (min-width: 1024px) {
  .auth-layout {
    grid-template-columns: 1fr 1fr;
    padding: 0;
  }
}

.auth-layout-left {
  display: none;
  background-color: var(--muted);
  color: var(--foreground);
  position: relative;
  height: 100vh;
  flex-direction: column;
  border-right: 1px solid var(--border);
  padding: 2.5rem;
}

@media (min-width: 1024px) {
  .auth-layout-left {
    display: flex;
  }
}

.auth-layout-left-header {
  position: relative;
  z-index: 20;
  margin-bottom: 2rem;
  flex-shrink: 0;
}

.auth-logo-link {
  display: inline-block;
  text-decoration: none;
  transition: opacity 0.2s;
}

.auth-logo-link:hover {
  opacity: 0.9;
}

.auth-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  display: block;
}

@media (min-width: 1280px) {
  .auth-logo {
    height: 48px;
  }
}

.auth-layout-left-content {
  position: relative;
  z-index: 20;
  margin-top: auto;
}

.auth-testimonial {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-testimonial-text {
  color: var(--foreground);
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.auth-testimonial-author {
  color: var(--foreground);
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.auth-layout-right {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
  width: 100%;
  padding-top: 10vh;
  padding-bottom: 10vh;
}

@media (min-width: 640px) {
  .auth-layout-right {
    max-width: 350px;
  }
}

.auth-layout-right-header {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .auth-layout-right-header {
    display: none;
  }
}

.auth-logo-link-mobile {
  display: inline-block;
  text-decoration: none;
  transition: opacity 0.2s;
}

.auth-logo-link-mobile:hover {
  opacity: 0.9;
}

.auth-logo-mobile {
  height: 36px;
  width: auto;
  object-fit: contain;
  display: block;
}

@media (min-width: 640px) {
  .auth-logo-mobile {
    height: 40px;
  }
}
</style>

