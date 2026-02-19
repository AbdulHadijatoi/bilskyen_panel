import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import i18n, { loadLocaleMessages, type SupportedLocale } from './plugins/i18n'

import App from './App.vue'
import router from './router'

const STORAGE_KEY = 'panel_locale'

async function bootstrap() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.use(vuetify)

  // Load initial locale messages before first render so vue-i18n does not warn on missing keys
  const stored = localStorage.getItem(STORAGE_KEY)
  const locale: SupportedLocale = stored === 'da' ? 'da' : 'en'
  await loadLocaleMessages(locale)

  app.mount('#app')
}

bootstrap()
