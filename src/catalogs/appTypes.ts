import type { AppType } from '@/types/models/appType'
export const APP_TYPES: AppType[] = [
  {
    id: 1,
    label: 'videogame',
    name: 'Videogame'
  },
  {
    id: 2,
    label: 'extension',
    name: 'Extension'
  }
] as const
