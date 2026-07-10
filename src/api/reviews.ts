import type { AxiosResponse } from 'axios'
import http from '@/api/http'
import type {
  ReviewResponseDto,
  CreateReviewPayload,
  UpdateReviewPayload
} from '@/types/models/review'
import type { PaginatedResponse } from '@/types/api'

export const getReviews = (
  page?: number,
  limit?: number
): Promise<AxiosResponse<PaginatedResponse<ReviewResponseDto>>> => {
  return http.get('/reviews', { params: { page, limit } })
}

export const getReviewsByAuthor = (
  authorId: string
): Promise<AxiosResponse<ReviewResponseDto[]>> => {
  return http.get('/reviews/author', { params: { authorId } })
}

export const getReviewsByRelease = (
  repoId: string,
  releaseId: string
): Promise<AxiosResponse<PaginatedResponse<ReviewResponseDto>>> => {
  return http.get('/reviews/release', { params: { repoId, releaseId } })
}

export const createReview = (
  data: CreateReviewPayload
): Promise<AxiosResponse<ReviewResponseDto>> => {
  return http.post('/reviews', data)
}

export const updateReview = (
  id: string,
  data: UpdateReviewPayload
): Promise<AxiosResponse<ReviewResponseDto>> => {
  return http.put('/reviews', data, { params: { id } })
}

export const deleteReview = (id: string): Promise<AxiosResponse<void>> => {
  return http.delete('/reviews', { params: { id } })
}
