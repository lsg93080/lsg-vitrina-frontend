import type { AppTypeLabel } from './appType'
import type { EsrbRatingValue } from './esrb'
import type { PlatformValue } from './platform'

export type ReportsHistoryAction = 'warn' | 'suspend' | 'reactivate' | 'reply'

export interface ReportsHistoryEntry {
  id: string
  action: ReportsHistoryAction
  message: string
  authorId: string
  authorName: string
  createdAt: string
}

export interface PublicationResponseDto {
  id: string
  repoId: string
  authorId: string
  title: string
  shortDescription: string
  description?: string
  type: AppTypeLabel
  esrbRating: EsrbRatingValue
  platforms: PlatformValue[]
  tags: string[]
  releaseYear: number
  status: string
  totalRating: number
  totalReviews: number
  averageRating: number
  downloads: number
  thumbnailUrl: string | null
  repoUrl?: string
  releasesURL?: string
  repoDetailsId?: string | null
  createdAt: string
  updatedAt: string
}
