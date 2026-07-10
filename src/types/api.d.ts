import type { User } from '@/types/models/user'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

export interface PublicationFilters {
  search?: string
  types?: string[]
  esrbRatings?: string[]
  platforms?: string[]
  tags?: string[]
  yearFrom?: number
  yearTo?: number
  orderBy?: 'totalRating' | 'downloads' | 'totalReviews'
  orderMode?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ContributorCheck {
  exists: boolean
  user?: User
}

export interface CreateReviewDto {
  repoId: number
  releaseId: number
  rating: number
  title: string
  body: string
}
