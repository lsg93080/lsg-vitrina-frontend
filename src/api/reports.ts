import type { AxiosResponse } from 'axios'
import http from '@/api/http'
import type { Report } from '@/types/models/report'
import type { PaginatedResponse } from '@/types/api'

export type ReportReason = 'nsfw' | 'inappropriate' | 'malware' | 'copyright' | 'other'
export type ReportAction = 'dismiss' | 'warn' | 'suspend'

export const createReport = (
  publicationId: string,
  reason: ReportReason,
  description: string
): Promise<AxiosResponse<Report>> => {
  return http.post('/reports', { publicationId, reason, description })
}

// Fetches all reports (admin only); optional filters passed as query params.
export const getReports = (
  filters?: Record<string, unknown>
): Promise<AxiosResponse<PaginatedResponse<Report>>> => {
  return http.get('/reports', { params: filters })
}

// Resolves a report by applying a moderation action (dismiss, warn, or suspend).
export const resolveReport = (
  id: string,
  action: ReportAction,
  message?: string
): Promise<AxiosResponse<Report>> => {
  return http.put('/reports/resolve', { action, message }, { params: { id } })
}
