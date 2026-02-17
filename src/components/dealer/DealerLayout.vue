<template>
  <v-app
    :style="{
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
    }"
  >
    <Sidebar />
    <v-main
      :style="{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        paddingTop: '0',
      }"
    >
      <Header />
      <div :style="{ padding: '1.5rem', paddingBottom: '3rem' }">
        <router-view v-slot="{ Component, route }">
          <transition
            :name="getTransitionName(route.meta.transition)"
            mode="out-in"
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
      <Footer />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import { useSidebarStore } from '@/stores/sidebar'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale.store'
import { ensureLocaleLoaded } from '@/plugins/i18n'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import Footer from './Footer.vue'

const sidebarStore = useSidebarStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const vuetifyTheme = useTheme()

const getTransitionName = (transition: unknown): string => {
  return typeof transition === 'string' ? transition : 'fade'
}

const handleResize = () => {
  sidebarStore.setMobile(window.innerWidth < 768)
}

onMounted(async () => {
  // Set Vuetify theme instance in the store
  if (vuetifyTheme) {
    themeStore.setVuetifyTheme(vuetifyTheme)
  }

  // Bootstrap i18n: load dealer locale and set vue-i18n (lazy load only when in dealer panel)
  await ensureLocaleLoaded(localeStore.locale)

  // Handle sidebar resize
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scale transition */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

