/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string

  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string

  /** Dév uniquement : active la sortie de secours locale si aucun fournisseur IA configuré. */
  readonly VITE_DEV_TEMPLATE_FALLBACK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
