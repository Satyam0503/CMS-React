/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASEURL?: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_CAPTCHA_SITE_KEY?: string;
  readonly VITE_APP_I18N_CONFIG_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
