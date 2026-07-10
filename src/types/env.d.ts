declare module '*.jpg' {
  const value: string
  export default value
}

declare module 'marked' {
  export function marked(src: string): string | Promise<string>
  export namespace marked {
    function parse(src: string): string | Promise<string>
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AUTH_SERVICE_URL: string
  readonly VITE_HOST_URL: string
  readonly VITE_CLOUD_MODULE_URL?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
