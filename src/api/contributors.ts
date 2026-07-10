import type { AxiosResponse } from 'axios'
import http from '@/api/http'
import type { ContributorResponseDto, UpdateContrInfoPayload } from '@/types/models/contributor'
import type { ContributorCheck } from '@/types/api'

export const getContributors = (): Promise<AxiosResponse<ContributorResponseDto[]>> => {
  return http.get('/contributors')
}

export const getContributorsActive = (): Promise<AxiosResponse<ContributorResponseDto[]>> => {
  return http.get('/contributors/active')
}

export const getContributorById = (id: string): Promise<AxiosResponse<ContributorResponseDto>> => {
  return http.get('/contributors/find', { params: { id } })
}

export const getContributorByUserId = (
  userId: string
): Promise<AxiosResponse<ContributorResponseDto>> => {
  return http.get('/contributors/find', { params: { userId } })
}

export const getTopContributor = (
  threshold = 1
): Promise<AxiosResponse<ContributorResponseDto[]>> => {
  return http.get('/contributors/stats/top', { params: { threshold } })
}

export const getMostContributions = (
  orderBy = 'postsQty',
  orderMode = 'desc',
  limit = 3
): Promise<AxiosResponse<ContributorResponseDto[]>> => {
  return http.get('/contributors/stats', { params: { orderBy, orderMode, limit } })
}

export const updateContributorByUserId = (
  userId: string,
  data: unknown
): Promise<AxiosResponse<ContributorResponseDto>> => {
  return http.put('/contributors', data, { params: { userId } })
}

export const deleteContributor = (id: string): Promise<AxiosResponse<void>> => {
  return http.delete('/contributors', { params: { id } })
}

export const checkContributorExists = (
  userId: string
): Promise<AxiosResponse<ContributorCheck>> => {
  return http.get('/contributors/check', { params: { userId } })
}

export const getContributorsStats = (): Promise<AxiosResponse> => {
  return http.get('/contributors/stats')
}

export const getContributorsTopRated = (): Promise<AxiosResponse<ContributorResponseDto[]>> => {
  return http.get('/contributors/top-rated')
}

export const searchContributors = (
  query: string
): Promise<AxiosResponse<ContributorResponseDto[]>> => {
  return http.get('/contributors/search', { params: { query } })
}

export const createContributor = (
  data: unknown
): Promise<AxiosResponse<ContributorResponseDto>> => {
  return http.post('/contributors', data)
}

export const updateContributor = (
  data: unknown
): Promise<AxiosResponse<ContributorResponseDto>> => {
  return http.put('/contributors', data)
}

// Updates the contrInfo subdocument (username, imgUrl, bio, socials, profileUrl).
export const updateContributorContrInfo = (
  userId: string,
  data: UpdateContrInfoPayload
): Promise<AxiosResponse<ContributorResponseDto>> => {
  return http.put('/contributors/contrInfo', data, { params: { userId } })
}
