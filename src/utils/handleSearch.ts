import { getPublications } from '@/api/publications'
import { searchContributors } from '@/api/contributors'
import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import type { AppType } from '@/types/models/appType'
import type { ESRB } from '@/types/models/esrb'
import type { Platform } from '@/types/models/platform'

interface FilterQuery {
  query?: string
  types?: AppType[]
  esrb?: ESRB[]
  platforms?: Platform[]
  selectedTag?: string
  startDate?: Date | null
  endDate?: Date | null
  yearFrom?: number | null
  yearTo?: number | null
}

export const handleSearch = async (
  currentRoute: Ref<RouteLocationNormalizedLoadedGeneric>,
  filterQuery: FilterQuery
) => {
  try {
    let result
    if (currentRoute.value.name === 'Publications') {
      // Map filter objects to plain value arrays matching the NestJS FilterPublicationsDto:
      // - search (string), types (PubType[]), esrbRatings (EsrbRating[]), platforms (Platform enum[])
      const params: Record<string, unknown> = {}

      // If any filter group is empty, the API call should be skipped and no results should be returned
      if (
        (filterQuery.types !== undefined && filterQuery.types.length === 0) ||
        (filterQuery.esrb !== undefined && filterQuery.esrb.length === 0) ||
        (filterQuery.platforms !== undefined && filterQuery.platforms.length === 0)
      ) {
        return []
      }

      if (filterQuery.query) {
        params.search = filterQuery.query
      }

      // Only send filters that actually restrict results. Omit when all values are selected
      if (filterQuery.types && filterQuery.types.length > 0) {
        params.types = filterQuery.types.map((t: AppType) => t.label)
      }

      if (filterQuery.esrb && filterQuery.esrb.length > 0) {
        params.esrbRatings = filterQuery.esrb.map((e: ESRB) => e.value)
      }

      if (filterQuery.platforms && filterQuery.platforms.length > 0) {
        params.platforms = filterQuery.platforms.map((p: Platform) => p.value)
      }

      const DEFAULT_YEAR_FROM = 2019
      const DEFAULT_YEAR_TO = new Date().getFullYear()

      const yearFrom =
        filterQuery.yearFrom ?? (filterQuery.startDate ? filterQuery.startDate.getFullYear() : null)
      const yearTo =
        filterQuery.yearTo ?? (filterQuery.endDate ? filterQuery.endDate.getFullYear() : null)

      // Only send year filters when they differ from the default range
      if (yearFrom !== null && yearFrom !== DEFAULT_YEAR_FROM) {
        params.yearFrom = yearFrom
      }

      if (yearTo !== null && yearTo !== DEFAULT_YEAR_TO) {
        params.yearTo = yearTo
      }

      if (filterQuery.selectedTag && filterQuery.selectedTag.trim() !== '') {
        params.tags = [filterQuery.selectedTag]
      }

      result = await getPublications(params as never)
    } else if (currentRoute.value.name === 'Contributors') {
      result = await searchContributors(filterQuery.query ?? '')
    }

    // API returns paginated response { data: [], total, ... } for publications, or a plain array for contributors. Extract the array in both cases
    const responseData = result?.data as unknown as { data?: unknown } | unknown[]
    const searchResults = Array.isArray(responseData)
      ? responseData
      : ((responseData as { data?: unknown }).data ?? responseData)
    return searchResults
  } catch {
    // Caller handles error state
  }
}
