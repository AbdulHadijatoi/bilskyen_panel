import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // Vuetify and its dependencies
            if (id.includes('vuetify') || id.includes('@mdi/font')) {
              return 'vuetify'
            }
            
            // ECharts and vue-echarts
            if (id.includes('echarts') || id.includes('vue-echarts')) {
              return 'echarts'
            }
            
            // Vue core libraries (excluding vue itself which is handled separately)
            if (id.includes('vue') && !id.includes('node_modules/vue/') && !id.includes('vue-router') && !id.includes('vue-echarts')) {
              return 'vue-vendor'
            }
            
            // Vue Router
            if (id.includes('vue-router')) {
              return 'vue-router'
            }
            
            // Pinia
            if (id.includes('pinia')) {
              return 'pinia'
            }
            
            // Axios
            if (id.includes('axios')) {
              return 'axios'
            }
            
            // VueUse
            if (id.includes('@vueuse')) {
              return 'vueuse'
            }
            
            // Lucide icons
            if (id.includes('lucide-vue-next')) {
              return 'lucide'
            }
            
            // Group other smaller vendor libraries together
            // Only create vendor chunk if there are actual dependencies
            const otherVendors = ['@vue', 'autoprefixer', 'postcss', 'tailwindcss']
            if (otherVendors.some(vendor => id.includes(vendor))) {
              return 'vendor'
            }
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return `assets/[name]-[hash].[ext]`
          }
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name]-[hash].[ext]`
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].[ext]`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].[ext]`
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash].[ext]`
          }
          return `assets/[name]-[hash].[ext]`
        },
      },
    },
    // Increase chunk size warning limit slightly, but we're splitting chunks to avoid this
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (optional, can be disabled for smaller builds)
    sourcemap: false,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vuetify',
      'axios',
      'echarts',
      'vue-echarts',
    ],
  },
})
