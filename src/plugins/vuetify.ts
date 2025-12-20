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
          // Using CSS variables that reference OKLCH colors from main.css
          primary: '#333333', // oklch(0.205 0 0) - dark gray/black
          secondary: '#f5f5f5', // oklch(0.97 0 0) - light gray
          background: '#ffffff', // oklch(1 0 0) - white
          surface: '#ffffff', // oklch(1 0 0) - white
          error: '#d32f2f', // oklch(0.577 0.245 27.325) - red
          info: '#1976d2',
          success: '#388e3c',
          warning: '#f57c00',
          'on-primary': '#ffffff', // oklch(0.985 0 0) - white
          'on-secondary': '#333333', // oklch(0.205 0 0) - dark gray
          'on-background': '#252525', // oklch(0.145 0 0) - very dark gray
          'on-surface': '#252525', // oklch(0.145 0 0) - very dark gray
        },
      },
      dark: {
        colors: {
          primary: '#e5e5e5', // oklch(0.922 0 0) - light gray
          secondary: '#444444', // oklch(0.269 0 0) - medium gray
          background: '#252525', // oklch(0.145 0 0) - very dark gray
          surface: '#333333', // oklch(0.205 0 0) - dark gray
          error: '#ef5350', // oklch(0.704 0.191 22.216) - lighter red
          info: '#42a5f5',
          success: '#66bb6a',
          warning: '#ffa726',
          'on-primary': '#252525', // oklch(0.205 0 0) - dark gray
          'on-secondary': '#ffffff', // oklch(0.985 0 0) - white
          'on-background': '#ffffff', // oklch(0.985 0 0) - white
          'on-surface': '#ffffff', // oklch(0.985 0 0) - white
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
