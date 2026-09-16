/// <reference types="vite/client" />

// Opt in to strict `import.meta.env` typing so only declared variables exist.
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  /** Base URL of the courses API. Defaults to the static mock under /data. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
