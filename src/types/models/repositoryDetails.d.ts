import type { Platform } from '@/types/models/platform'
import type { ESRB } from '@/types/models/esrb'
import type { Release } from '@/types/models/release'

export interface RepositoryDetails {
  repoName: string
  repoDesc?: string
  repoDoc?: string
  license?: string
  ESRB?: ESRB
  platforms?: Platform[]
  releases?: Release[]
  repoUrl: string
  reviewers?: {
    userId: string
    email: string
    isCancelled: boolean
  }[]
  repoId: number
  contrId?: string
}
