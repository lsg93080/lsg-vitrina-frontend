import type { Platform } from '@/types/models/platform'
import type { ESRB } from '@/types/models/esrb'
import type { RepositoryDetails } from '@/types/models/repositoryDetails'
import type { Status } from '@/types/models/status'
import type { AppType } from '@/types/models/appType'

export interface Repository {
  // NestJS fields
  id?: string
  title?: string
  type?: string
  thumbnailUrl?: string
  authorId?: string
  totalReviews?: number
  averageRating?: number
  esrbRating?: string
  language?: string
  description?: string

  // Express legacy fields (faker and unmigrated components)
  repoId: number
  contrId: string
  ownerId: number
  author: string
  pubName: string
  pubType: AppType
  releasesURL: string
  downloads: number
  imgUrl: string
  lastStatus: Status
  lastReleaseDate: Date
  tags: Array<{
    id: number
    name: string
  }>
  repoDetails: RepositoryDetails
  totalComments: number
  totalRating: number
  ESRB: ESRB
  platforms: Platform[]
  createdAt?: Date
  updatedAt?: Date
}
