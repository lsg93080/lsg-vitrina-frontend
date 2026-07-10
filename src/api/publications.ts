import type { AxiosResponse } from 'axios'
import http from '@/api/http'
import type { PublicationFilters, PaginatedResponse } from '@/types/api'
import type { PublicationResponseDto, ReportsHistoryEntry } from '@/types/models/publication'

// Paginated, filtered list; all filter fields are optional query params.
export const getPublications = (
  filters?: PublicationFilters
): Promise<AxiosResponse<PaginatedResponse<PublicationResponseDto>>> => {
  return http.get('/publications', { params: filters })
}

export const getPublicationById = (id: string): Promise<AxiosResponse<PublicationResponseDto>> => {
  return http.get('/publications/find', { params: { id } })
}

// Fetches the full publication record (including details and releases) by repoId.
export const getPublicationFull = (
  repoId: string
): Promise<AxiosResponse<PublicationResponseDto>> => {
  return http.get(`/publications/full/${repoId}`)
}

export const getPublicationsByAuthor = (
  contrId: string
): Promise<AxiosResponse<PublicationResponseDto[]>> => {
  return http.get('/publications/author', { params: { contrId } })
}

export const getPublicationsStats = (): Promise<AxiosResponse> => {
  return http.get('/publications/stats')
}

// Top-rated publication of a given type (e.g. 'Videogame', 'Extension').
export const getTopRatedPublication = (
  type: string,
  threshold = 1
): Promise<AxiosResponse<PublicationResponseDto[]>> => {
  return http.get('/publications/stats/top', { params: { type: type.toLowerCase(), threshold } })
}

export const getMostDownloadedPublication = (
  type: string,
  orderBy = 'downloads',
  orderMode = 'desc',
  limit = 1
): Promise<AxiosResponse<PublicationResponseDto[]>> => {
  return http.get('/publications/stats', {
    params: { orderBy, orderMode, type: type.toLowerCase(), limit }
  })
}

export const createPublication = (
  data: unknown
): Promise<AxiosResponse<PublicationResponseDto>> => {
  return http.post('/publications', data)
}

export const updatePublication = (
  repoId: string,
  data: unknown
): Promise<AxiosResponse<PublicationResponseDto>> => {
  return http.put('/publications', data, { params: { repoId } })
}

// Increments the download counter for a publication and its author
export const trackDownload = (repoId: string): Promise<AxiosResponse<void>> => {
  return http.post('/publications/download', null, { params: { repoId } })
}

export const deletePublication = (id: string): Promise<AxiosResponse<void>> => {
  return http.delete('/publications', { params: { id } })
}

// Fetches the reports history for a publication (author or admin only)
export const getReportsHistory = (
  repoId: string
): Promise<AxiosResponse<ReportsHistoryEntry[]>> => {
  return http.get(`/publications/${repoId}/reports-history`)
}

// Author replies to the admin in the reports history thread
export const replyToReportsHistory = (
  repoId: string,
  message: string
): Promise<AxiosResponse<ReportsHistoryEntry[]>> => {
  return http.post(`/publications/${repoId}/reports-history`, { message })
}

// Admin reactivates a suspended publication
export const reactivatePublication = (
  repoId: string,
  message: string
): Promise<AxiosResponse<ReportsHistoryEntry[]>> => {
  return http.put(`/publications/${repoId}/reactivate`, { message })
}
