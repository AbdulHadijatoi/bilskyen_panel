import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#03418b',
          secondary: '#f0f1f4',
          background: '#f4f5f7',
          surface: '#ffffff',
          error: '#ef4444',
          info: '#03418b',
          success: '#10b981',
          warning: '#f59e0b',
          'on-primary': '#ffffff',
          'on-secondary': '#1a1d21',
          'on-background': '#1a1d21',
          'on-surface': '#1a1d21',
          'on-info': '#ffffff',
          'on-success': '#ffffff',
          'on-warning': '#1a1d21',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-family: "Sora", sans-serif;',
    },
    VCard: {
      elevation: 0,
      rounded: 'lg',
      style: 'font-family: "Sora", sans-serif; border: 1px solid #e5e7eb;',
    },
    VDataTable: {
      style: 'font-family: "Sora", sans-serif;',
    },
  },
})
