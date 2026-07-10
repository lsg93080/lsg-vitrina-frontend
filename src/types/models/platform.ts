export enum PlatformValue {
  MACOS = 'macos',
  WINDOWS = 'windows',
  LINUX = 'linux',
  ANDROID = 'android'
}

export interface Platform {
  id: number
  name: string
  value: PlatformValue
  icon: string[]
}
