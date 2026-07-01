/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** Panel UI locale: `en` or `da`. Omit in production (defaults to Danish). */
  readonly VITE_APP_LOCALE?: 'en' | 'da'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
