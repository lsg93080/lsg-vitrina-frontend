import type { AxiosResponse } from 'axios'
import http from '@/api/http'
import type {
  CreateReleasePayload,
  PaginatedReleases,
  Release,
  UpdateReleasePayload
} from '@/types/models/release'

export const getPublicationDetails = (): Promise<AxiosResponse> => {
  return http.get('/publication-details')
}

export const getPublicationDetailsByRepoId = (repoId: string): Promise<AxiosResponse> => {
  return http.get('/publication-details/find', { params: { repoId } })
}

export const createPublicationDetails = (data: unknown): Promise<AxiosResponse> => {
  return http.post('/publication-details', data)
}

export const updatePublicationDetails = (repoId: string, data: unknown): Promise<AxiosResponse> => {
  return http.put('/publication-details', data, { params: { repoId } })
}

// Updates the rating counters (comment, rating, download) for a release; all three are required.
export const updatePublicationDetailsRating = (
  repoId: string,
  releaseId: string,
  commentValue: number,
  ratingValue: number,
  downloadValue: number
): Promise<AxiosResponse> => {
  return http.put(
    '/publication-details/rating',
    {
      comment: commentValue,
      rating: ratingValue,
      download: downloadValue
    },
    {
      params: { repoId, releaseId }
    }
  )
}

export const deletePublicationDetails = (id: string): Promise<AxiosResponse> => {
  return http.delete('/publication-details', { params: { id } })
}

export const getReleases = (repoId: string, page = 1, limit = 20): Promise<PaginatedReleases> => {
  return http
    .get('/publication-details/releases', { params: { repoId, page, limit } })
    .then((res) => res.data)
}

export const createRelease = (repoId: string, data: CreateReleasePayload): Promise<Release> => {
  return http
    .post('/publication-details/releases', data, { params: { repoId } })
    .then((res) => res.data)
}

export const updateRelease = (id: string, data: UpdateReleasePayload): Promise<Release> => {
  return http.put('/publication-details/releases', data, { params: { id } }).then((res) => res.data)
}

export const deleteRelease = (id: string): Promise<void> => {
  return http.delete('/publication-details/releases', { params: { id } })
}
