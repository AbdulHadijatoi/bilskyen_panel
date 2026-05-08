import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import i18n, { loadLocaleMessages } from './plugins/i18n'

import App from './App.vue'
import router from './router'

async function bootstrap() {
  const app = createApp(App)

  // Silence Pinia devtools "store installed" console toasts.
  if (import.meta.env.DEV) {
    ;(globalThis as any).__VUE_DEVTOOLS_TOAST__ = () => {}
  }

  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.use(vuetify)

  // Load Danish before first render; panel language switching is disabled.
  await loadLocaleMessages('da')

  app.mount('#app')
}

bootstrap()
