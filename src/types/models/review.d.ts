// Legacy Review type (Express backend), kept for backward compat in existing components.
export interface Review {
  _id: number
  repoName: string
  releaseName: string
  releaseId: number
  isReviewed: boolean
  isSafe: boolean
  reviewDate: Date
  additionalComments?: string
  link?: string
  reviewer: {
    userId: string
    rating: number
  }
  createdAt?: string
  updatedAt?: string
}

// NestJS backend DTO for a user review (comment) on a publication.
export interface ReviewResponseDto {
  id: string
  authorId: string
  authorName: string
  repoId: string
  releaseId: string
  rating: number
  title: string
  comment: string
  createdAt: string
  updatedAt: string
}

export interface CreateReviewPayload {
  repoId: string
  releaseId: string
  rating: number
  title: string
  comment: string
}

export interface UpdateReviewPayload {
  title?: string
  comment?: string
  rating?: number
}
