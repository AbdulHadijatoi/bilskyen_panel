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
          // Brand colors from brand guide
          primary: '#004aad', // Main brand color
          secondary: '#f5f5f5', // oklch(0.97 0 0) - light gray
          background: '#ffffff', // oklch(1 0 0) - white
          surface: '#ffffff', // oklch(1 0 0) - white
          error: '#d32f2f', // oklch(0.577 0.245 27.325) - red
          info: '#1976d2',
          success: '#388e3c',
          warning: '#f57c00',
          'on-primary': '#ffffff', // oklch(0.985 0 0) - white
          'on-secondary': '#252525', // oklch(0.145 0 0) - dark text on secondary
          'on-background': '#252525', // oklch(0.145 0 0) - very dark gray
          'on-surface': '#252525', // oklch(0.145 0 0) - very dark gray
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-family: "Sora", sans-serif;',
    },
    VCard: {
      style: 'font-family: "Sora", sans-serif;',
    },
    VDataTable: {
      style: 'font-family: "Sora", sans-serif;',
    },
  },
})
