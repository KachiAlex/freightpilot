/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_MAPBOX_TOKEN?: string
    readonly VITE_MAPBOX_STYLE?: string
  }
}

export {}
