export type ReleaseStatus = 'pending' | 'approved' | 'suspended'

// Release as returned by the Vitrina API (NestJS backend).
export interface Release {
  id: string
  repoId: string
  version: string
  title: string
  shortDescription: string
  releaseNotes: string
  releaseDate: string
  downloadUrl: string | null
  status: ReleaseStatus
  totalRating: number
  totalReviews: number
  averageRating: number
  createdAt: string
  updatedAt: string
}

export interface CreateReleasePayload {
  version: string
  title: string
  shortDescription: string
  releaseNotes?: string
  releaseDate: string
  downloadUrl?: string
}

export interface UpdateReleasePayload {
  version?: string
  title?: string
  shortDescription?: string
  releaseNotes?: string
  releaseDate?: string
  downloadUrl?: string
}

export interface PaginatedReleases {
  data: Release[]
  total: number
  page: number
  limit: number
  totalPages: number
}
