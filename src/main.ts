import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import i18n, { loadLocaleMessages } from './plugins/i18n'
import { getInitialLocale } from './utils/defaultLocale'
import { useLocaleStore } from './stores/locale.store'
import { usePlatformSettingsStore } from './stores/platformSettings.store'

import App from './App.vue'
import router from './router'

async function bootstrap() {
  const app = createApp(App)

  // Silence Pinia devtools "store installed" console toasts.
  if (import.meta.env.DEV) {
    ;(globalThis as any).__VUE_DEVTOOLS_TOAST__ = () => {}
  }

  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(vuetify)

  const initialLocale = getInitialLocale()
  await loadLocaleMessages(initialLocale)

  const localeStore = useLocaleStore(pinia)
  await localeStore.initialize()

  const platformSettingsStore = usePlatformSettingsStore(pinia)
  await platformSettingsStore.load()

  app.mount('#app')
}

bootstrap()
