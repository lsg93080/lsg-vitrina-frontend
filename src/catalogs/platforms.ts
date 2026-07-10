import type { Platform } from '@/types/models/platform'
import { PlatformValue } from '@/types/models/platform'

export const PLATFORMS: Platform[] = [
  { id: 1, name: 'Mac OS', value: PlatformValue.MACOS, icon: ['fab', 'apple'] },
  { id: 2, name: 'Windows', value: PlatformValue.WINDOWS, icon: ['fab', 'windows'] },
  { id: 3, name: 'Linux', value: PlatformValue.LINUX, icon: ['fab', 'linux'] },
  { id: 4, name: 'Android', value: PlatformValue.ANDROID, icon: ['fab', 'android'] }
]
