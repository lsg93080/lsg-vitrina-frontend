<template>
  <section class="w-full overflow-y-auto p-8">
    <header class="p-0 text-start">
      <h2>{{ t('nav.stats') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">{{ t('stats.subtitle') }}</p>
    </header>

    <LoadingState v-if="isFetching" size="lg" />

    <EmptyState
      v-else-if="fetchError"
      :icon="['fas', 'triangle-exclamation']"
      :title="t('store.error-loading')"
      :primary-action="{
        label: t('store.retry'),
        icon: ['fas', 'rotate-right'],
        action: fetchStats
      }"
    />

    <div v-else class="flex flex-col gap-8 py-4">
      <!-- Publications: Most Downloaded and Top Rated -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatHighlightCard
          :title="t('stats.most-downloaded')"
          :icon="['fas', 'download']"
          :items="mostDownloadedItems"
          @navigate="goToPublication"
        />
        <StatHighlightCard
          :title="t('stats.top-rated')"
          :icon="['fas', 'star']"
          :items="topRatedItems"
          @navigate="goToPublication"
        />
      </div>

      <!-- Bottom row: Contributors and Charts -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 px-1">
            <font-awesome-icon
              :icon="['fas', 'chess-queen']"
              class="text-sm text-[var(--primary-color)]"
            />
            <h3 class="lsg-card__title">{{ t('stats.most-contributions') }}</h3>
          </div>
          <ContrCard v-if="topContributorCard" :contr-details="topContributorCard" />
          <div v-else class="lsg-card flex items-center justify-center p-6">
            <p class="text-sm text-[var(--text-color-light)]">{{ t('status.no-data') }}</p>
          </div>
        </div>

        <div class="lsg-card flex flex-col items-center gap-4 p-6">
          <h3 class="lsg-card__title">{{ t('stats.chart-application-type') }}</h3>
          <div class="lsg-card__underline" />

          <div class="mx-auto w-full max-w-[14rem]">
            <PieChart
              :key="theme"
              :library="pieLibrary"
              :data="chartApplicationData"
              :messages="{ empty: t('status.no-data') }"
              :colors="['#FA5E15', '#018ABE']"
            />
          </div>
        </div>

        <!-- Top 3 Contributors ranking -->
        <div class="lsg-card flex flex-col items-center gap-4 p-6">
          <h3 class="lsg-card__title">{{ t('stats.top-contributors') }}</h3>
          <div class="lsg-card__underline" />

          <div
            v-if="topContributors.length > 0"
            class="flex w-full flex-col divide-y divide-white/10"
          >
            <div
              v-for="(contributor, index) in topContributors"
              :key="index"
              class="flex items-center gap-3 py-3"
            >
              <font-awesome-icon
                :icon="['fas', 'trophy']"
                class="text-lg"
                :style="{ color: trophyColors[index] }"
              />
              <span class="text-xs font-bold text-[var(--text-color-light)]">#{{ index + 1 }}</span>
              <span class="text-sm font-semibold text-[var(--text-color)]">
                {{ formatUsername(contributor?.contrInfo?.username) }}
              </span>
            </div>
          </div>
          <p v-else class="py-4 text-sm text-[var(--text-color-light)]">
            {{ t('status.no-data') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useChartTheme } from '@/composables/useChartTheme'
import PieChart from '@/components/common/PieChart.vue'
import { useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatHighlightCard from '@/components/stats/StatHighlightCard.vue'
import ContrCard from '@/components/contributors/ContrCard.vue'
import type { HighlightItem } from '@/components/stats/StatHighlightCard.vue'
import {
  getPublications,
  getTopRatedPublication,
  getMostDownloadedPublication
} from '@/api/publications'
import { getTopContributor, getMostContributions } from '@/api/contributors'
import { useI18n } from 'vue-i18n'
import { formatUsername } from '@/utils/formatUsername'
import type { PublicationResponseDto } from '@/types/models/publication'
import type { ContributorResponseDto, ContributorCardDto } from '@/types/models/contributor'

const { t } = useI18n()
const router = useRouter()
const { theme, pieLibrary } = useChartTheme()

const trophyColors = ['#C9B037', '#B4B4B4', '#AD8A56']

const videogameCount = ref(0)
const extensionCount = ref(0)
const chartApplicationData = ref<any>(undefined)
const topRatedVideogame = ref<PublicationResponseDto | null>(null)
const topRatedExtension = ref<PublicationResponseDto | null>(null)
const mostDownloadedVideogame = ref<PublicationResponseDto | null>(null)
const mostDownloadedExtension = ref<PublicationResponseDto | null>(null)
const topContributions = ref<ContributorResponseDto | null>(null)
const topContributors = ref<ContributorResponseDto[]>([])
const isFetching = ref<boolean | null>(null)
const fetchError = ref(false)

const mostDownloadedItems = computed<HighlightItem[]>(() => [
  {
    publication: mostDownloadedVideogame.value,
    typeIcon: ['fas', 'gamepad'],
    typeLabel: 'Videogame'
  },
  {
    publication: mostDownloadedExtension.value,
    typeIcon: ['fas', 'puzzle-piece'],
    typeLabel: 'Extension'
  }
])

const topRatedItems = computed<HighlightItem[]>(() => [
  { publication: topRatedVideogame.value, typeIcon: ['fas', 'gamepad'], typeLabel: 'Videogame' },
  {
    publication: topRatedExtension.value,
    typeIcon: ['fas', 'puzzle-piece'],
    typeLabel: 'Extension'
  }
])

function toCardDto(c: ContributorResponseDto): ContributorCardDto {
  return {
    id: c.id,
    userId: c.userId,
    username: c.contrInfo.username,
    imgUrl: c.contrInfo.imgUrl || null,
    bio: c.contrInfo.bio,
    postsQty: c.contrInfo.postsQty,
    videogamesQty: c.contrInfo.videogamesQty,
    extensionsQty: c.contrInfo.extensionsQty,
    totalRating: c.contrInfo.totalRating,
    totalComments: c.contrInfo.totalComments,
    downloads: c.contrInfo.downloads,
    lastPost: c.contrInfo.lastPost,
    socials: c.contrInfo.socials ?? {}
  }
}

const topContributorCard = computed<ContributorCardDto | null>(() =>
  topContributions.value ? toCardDto(topContributions.value) : null
)

const goToPublication = (pub: PublicationResponseDto | null) => {
  if (pub?.repoId) router.push({ name: 'Details', query: { repoId: pub.repoId } })
}

async function fetchStats() {
  try {
    fetchError.value = false
    isFetching.value = true
    const results = await Promise.allSettled([
      getTopRatedPublication('Videogame'), // 0
      getTopRatedPublication('Extension'), // 1
      getMostDownloadedPublication('Videogame'), // 2
      getMostDownloadedPublication('Extension'), // 3
      getTopContributor(), // 4
      getMostContributions('totalRating', 'desc', 3), // 5: top rated contributors
      getPublications({ types: ['videogame'], limit: 1 }), // 6
      getPublications({ types: ['extension'], limit: 1 }) // 7
    ])

    const get = (i: number) => (results[i].status === 'fulfilled' ? results[i].value.data : null)

    topRatedVideogame.value = get(0)?.[0] ?? null
    topRatedExtension.value = get(1)?.[0] ?? null
    mostDownloadedVideogame.value = get(2)?.[0] ?? null
    mostDownloadedExtension.value = get(3)?.[0] ?? null
    topContributions.value = get(4)?.[0] ?? null
    topContributors.value = get(5) ?? []

    videogameCount.value = get(6)?.total ?? 0
    extensionCount.value = get(7)?.total ?? 0

    chartApplicationData.value = [
      ['Videogame', videogameCount.value],
      ['Extension', extensionCount.value]
    ]
  } catch {
    fetchError.value = true
  } finally {
    isFetching.value = false
  }
}

onMounted(fetchStats)
</script>
