import type { Contributor } from '@/types/models/contributor'

export interface User {
  uid: string
  email: string | null
  isReviewer: boolean
  platforms: Array<{ id: number; name: string; icon: Array<string> }>
  contrInfo: Contributor | null
}
