import { ref, toValue } from 'vue'
import type { Ref } from 'vue'
import type { Repository } from '@/types/models/repository'
import { getPublicationsByAuthor, updatePublication, deletePublication } from '@/api/publications'
import { useI18n } from 'vue-i18n'
import type { AxiosResponse } from 'axios'
import type { Platform } from '@/types/models/platform'
import { PlatformValue } from '@/types/models/platform'
import { EsrbRatingValue } from '@/types/models/esrb'
import type { ESRB } from '@/types/models/esrb'
import type { AppType } from '@/types/models/appType'

export function useApp(apps: Ref<Repository[]> = ref<Repository[]>([])) {
  const { t } = useI18n()
  const isFetching = ref(false)
  const message = ref<{ text: string; severity: string }>()

  const ESRBRatings: ESRB[] = [
    {
      id: 1,
      name: 'Everyone',
      label: 'everyone',
      value: EsrbRatingValue.EVERYONE,
      imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/E.svg'
    },
    {
      id: 2,
      name: 'Everyone 10+',
      label: 'everyone10',
      value: EsrbRatingValue.EVERYONE_10_PLUS,
      imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg'
    },
    {
      id: 3,
      name: 'Teen',
      label: 'teen',
      value: EsrbRatingValue.TEEN,
      imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/T.svg'
    },
    {
      id: 4,
      name: 'Mature 17+',
      label: 'mature17',
      value: EsrbRatingValue.MATURE_17_PLUS,
      imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/M.svg'
    },
    {
      id: 5,
      name: 'Adults Only 18+',
      label: 'adults18',
      value: EsrbRatingValue.ADULTS_ONLY_18_PLUS,
      imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/AO.svg'
    },
    {
      id: 6,
      name: 'Rating Pending',
      label: 'rating-pending',
      value: EsrbRatingValue.RATING_PENDING,
      imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/RP.svg'
    }
  ]

  const pubTypes: AppType[] = [
    { id: 1, name: 'Videogame', label: 'videogame' },
    { id: 2, name: 'Extension', label: 'extension' }
  ]
  const platforms: Platform[] = [
    { id: 1, name: 'Mac OS', value: PlatformValue.MACOS, icon: ['fab', 'apple'] },
    { id: 2, name: 'Windows', value: PlatformValue.WINDOWS, icon: ['fab', 'windows'] },
    { id: 3, name: 'Linux', value: PlatformValue.LINUX, icon: ['fab', 'linux'] },
    { id: 4, name: 'Android', value: PlatformValue.ANDROID, icon: ['fab', 'android'] }
  ]

  const count = ref(0)
  // Only used during development for CDD (Component Driven Development)
  const fakeApps = async () => {
    if (!import.meta.env.DEV) return
    const { faker } = await import('@faker-js/faker')
    apps.value = Array.from({ length: 50 }, () => ({
      repoId: ++count.value,
      contrId: 'rKOKXWb3Z4SORFrZ0xZEfXuLup02',
      ownerId: faker.number.int({ min: 1, max: 1000 }),
      author: faker.internet.username(),
      pubName: faker.company.name(),
      pubType: faker.helpers.arrayElement(pubTypes),
      releasesURL: faker.internet.url({ protocol: 'https', appendSlash: true }),
      downloads: faker.number.int({ min: 0, max: 100000 }),
      imgUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
      lastStatus: {
        releaseId: faker.number.int({ min: 1, max: 1000 }),
        reviewerId: faker.string.uuid(),
        isReviewed: faker.datatype.boolean(),
        isSafe: faker.datatype.boolean(),
        additionalComments: faker.lorem.sentence(),
        reviewDate: faker.date.past()
      },
      lastReleaseDate: faker.date.past(),
      tags: Array.from({ length: 3 }, () => ({
        id: faker.number.int({ min: 1, max: 100 }),
        name: faker.commerce.productAdjective()
      })),
      repoDetails: {
        repoId: faker.number.int({ min: 1, max: 1000 }),
        repoName: faker.company.name(),
        repoDesc: faker.lorem.paragraph(),
        repoDoc: faker.internet.url(),
        license: faker.lorem.word(),
        repoUrl: faker.internet.url()
      },
      totalComments: faker.number.int({ min: 0, max: 500 }),
      totalRating: faker.number.int({ min: 0, max: 5 }),
      ESRB: faker.helpers.arrayElement(ESRBRatings),
      platforms: faker.helpers.arrayElements(platforms, { min: 1, max: platforms.length }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))
  }

  // Fetches the user's apps into the list; sets an error message on failure and toggles isFetching.
  const fetchUserApps = async (userId: string) => {
    isFetching.value = true
    try {
      const response = await getPublicationsByAuthor(userId)
      // NestJS returns an array directly for getByAuthor (no pagination wrapper)
      apps.value = response.data as unknown as Repository[]
    } catch (error) {
      message.value = { text: t('contributions.message.fetch-apps-failure'), severity: 'error' }
    } finally {
      isFetching.value = false
    }
  }

  // Edits app locally and remotely
  const updateAppEverywhere = async (id: number, newAppData: Partial<Repository>) => {
    try {
      const repoId = String(id)
      const apiPayload: Record<string, unknown> = {}
      if (newAppData.title !== undefined) apiPayload.title = newAppData.title
      if (newAppData.thumbnailUrl !== undefined) apiPayload.thumbnailUrl = newAppData.thumbnailUrl
      const response = await updatePublication(repoId, apiPayload)
      if (response.status === 200) {
        // Update local list if present (MyApps context), skip silently if empty (AppDetails context)
        const index = toValue(apps).findIndex((app) => app.repoId === id)
        if (index !== -1) {
          toValue(apps)[index] = { ...toValue(apps)[index], ...newAppData } as Repository
        }
        message.value = {
          severity: 'success',
          text: t('contributions.message.update-app-success')
        }
        return true
      } else {
        throw new Error('Failed to update app')
      }
    } catch (error) {
      message.value = { severity: 'error', text: t('contributions.message.update-app-failure') }
      return false
    }
  }

  // Deletes app locally and remotely
  const deleteAppEverywhere = async (mongoId: string, repoId: number) => {
    try {
      const response = await deletePublication(mongoId)
      if (response.status === 200 || response.status === 204) {
        const index = toValue(apps).findIndex((app) => app.repoId === repoId)
        if (index !== -1) {
          toValue(apps).splice(index, 1)
        }
        message.value = {
          text: t('contributions.message.delete-app-success'),
          severity: 'success'
        }
        return true
      } else {
        throw new Error('Failed to delete app')
      }
    } catch (error) {
      message.value = {
        text: t('contributions.message.delete-app-failure'),
        severity: 'error'
      }
      return false
    }
  }

  return {
    apps,
    isFetching,
    message,
    fetchUserApps,
    updateAppEverywhere,
    deleteAppEverywhere
  }
}
