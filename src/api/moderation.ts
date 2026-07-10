import http from '@/api/http'
import type { PaginatedResponse } from '@/types/api'

export interface ReviewerVerdict {
  isSafe: boolean
  comment: string | null
}

export interface ReviewerAssignment {
  id: string
  publicationRepoId: string
  reviewerId: string
  reviewerEmail: string
  status: 'pending' | 'done'
  verdict: ReviewerVerdict | null
  assignedAt: string
  reviewedAt: string | null
}

export type MyAssignmentsResponse = PaginatedResponse<ReviewerAssignment>

export const getMyAssignments = (
  page = 1,
  limit = 50
): Promise<import('axios').AxiosResponse<MyAssignmentsResponse>> => {
  return http.get('/moderation/my-assignments', { params: { page, limit } })
}

export const getMyAssignmentsHistory = (
  page = 1,
  limit = 20
): Promise<import('axios').AxiosResponse<MyAssignmentsResponse>> => {
  return http.get('/moderation/my-assignments/history', { params: { page, limit } })
}

export const submitVerdict = (
  assignmentId: string,
  body: { isSafe: boolean; comment?: string }
): Promise<import('axios').AxiosResponse<void>> => {
  return http.post(`/moderation/assignments/${assignmentId}/verdict`, body)
}

export const getMyAssignmentForPublication = (
  repoId: string
): Promise<import('axios').AxiosResponse<MyAssignmentsResponse>> => {
  return http.get('/moderation/my-assignments', {
    params: { publicationRepoId: repoId, limit: 1 }
  })
}
