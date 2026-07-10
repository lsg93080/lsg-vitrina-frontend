export type ReportReason = 'nsfw' | 'inappropriate' | 'malware' | 'copyright' | 'other'
export type ReportStatus = 'pending' | 'dismissed' | 'warned' | 'suspended'
export type ReportAction = 'dismiss' | 'warn' | 'suspend'

export interface Report {
  id: string
  publicationId: string
  reporterId: string
  reporterName?: string
  publicationAuthorName?: string
  publicationStatus?: string
  reason: ReportReason
  description: string
  status: ReportStatus
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateReportDto {
  publicationId: string
  reason: ReportReason
  description?: string
}
