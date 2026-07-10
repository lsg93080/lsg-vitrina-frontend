<template>
  <aside class="flex flex-col gap-4">
    <div class="lsg-card p-5">
      <div class="mb-4 flex justify-center">
        <font-awesome-icon
          :icon="vcsIcon"
          class="text-5xl text-[var(--text-color)] transition-all duration-300 hover:text-[var(--primary-color)]"
        />
      </div>
      <Button
        :label="t('details.go-to-repo')"
        class="w-full"
        style="box-shadow: 0 0 14px var(--primary-color-30)"
        :disabled="!repoUrl"
        @click="openRepo"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-2" />
        </template>
      </Button>
    </div>

    <div class="lsg-card p-5">
      <div class="flex flex-col divide-y divide-white/10">
        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3 first:pt-0">
          <span class="text-sm text-[var(--text-color-light)]">{{ t('details.license') }}</span>
          <span class="text-sm text-[var(--text-color)]">{{ license }}</span>
        </div>

        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3">
          <span class="text-sm text-[var(--text-color-light)]">{{ t('details.platforms') }}</span>
          <div class="flex gap-3">
            <font-awesome-icon
              v-for="p in platformIcons"
              :key="p.value"
              :icon="p.icon"
              class="text-lg text-[var(--text-color)] transition-colors duration-300 hover:text-[var(--primary-color)]"
              v-tooltip.top="p.name"
            />
            <span v-if="platformIcons.length === 0" class="text-sm text-[var(--text-color-light)]"
              >--</span
            >
          </div>
        </div>

        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3">
          <span class="text-sm text-[var(--text-color-light)]">{{ t('details.esrb-rating') }}</span>
          <div v-if="esrbEntry" class="flex items-center gap-2">
            <img :src="esrbEntry.imageURL" :alt="esrbEntry.name" class="h-8 w-auto" />
            <span class="text-sm text-[var(--text-color)]">{{ t(`esrb.${esrbEntry.label}`) }}</span>
          </div>
          <span v-else class="text-sm text-[var(--text-color-light)]">--</span>
        </div>

        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3">
          <span class="text-sm text-[var(--text-color-light)]">{{ t('details.type') }}</span>
          <div class="flex items-center gap-2">
            <font-awesome-icon :icon="typeIcon" class="text-[var(--primary-color)]" />
            <span class="text-sm text-[var(--text-color)]">{{ typeName }}</span>
          </div>
        </div>

        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3">
          <span class="text-sm text-[var(--text-color-light)]">{{
            t('details.release-year')
          }}</span>
          <span class="text-sm text-[var(--text-color)]">{{
            publication.releaseYear || '--'
          }}</span>
        </div>

        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3">
          <span class="text-sm text-[var(--text-color-light)]">{{ t('details.author') }}</span>
          <span class="text-sm text-[var(--primary-color)]">
            {{ authorName || '--' }}
          </span>
        </div>

        <div class="grid grid-cols-[7rem_1fr] items-center gap-2 py-3 last:pb-0">
          <span class="text-sm text-[var(--text-color-light)]">{{ t('details.downloads') }}</span>
          <div class="flex items-center gap-2">
            <font-awesome-icon
              :icon="['fas', 'download']"
              class="text-xs text-[var(--text-color-light)]"
            />
            <span class="text-sm text-[var(--text-color)]">{{ formattedDownloads }}</span>
          </div>
        </div>
      </div>
    </div>

    <DetailsRatingCard
      :average-rating="publication.averageRating ?? 0"
      :total-reviews="publication.totalReviews ?? 0"
      :rating-distribution="ratingDistribution"
      :can-review="props.canReview"
      @scroll-to-reviews="emit('scrollToReviews')"
      @write-review="emit('writeReview')"
    />

    <div v-if="esrbEntry" class="lsg-card p-5">
      <div class="flex items-start gap-4">
        <img :src="esrbEntry.imageURL" :alt="esrbEntry.name" class="h-16 w-auto shrink-0" />
        <div>
          <h4 class="mb-1 text-base font-semibold text-[var(--text-color)]">
            {{ t(`esrb.${esrbEntry.label}`) }}
          </h4>
          <p class="text-xs leading-relaxed text-[var(--text-color-light)]">
            {{ t(`esrb.${esrbEntry.label}-description`) }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import DetailsRatingCard from './DetailsRatingCard.vue'
import type { PublicationResponseDto } from '@/types/models/publication'
import { PLATFORMS } from '@/catalogs/platforms'
import { ESRB_RATINGS } from '@/catalogs/esrbRatings'
import { APP_TYPES } from '@/catalogs/appTypes'

interface RatingLevel {
  star: number
  count: number
}

interface Props {
  publication: PublicationResponseDto
  repoUrl?: string
  authorName?: string
  ratingDistribution?: RatingLevel[]
  canReview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  repoUrl: undefined,
  authorName: undefined,
  ratingDistribution: () => [],
  canReview: false
})

const emit = defineEmits<{
  scrollToReviews: []
  writeReview: []
}>()

const { t } = useI18n()

const vcsIcon = computed<[string, string]>(() => {
  const url = props.repoUrl?.toLowerCase() ?? ''
  if (url.includes('gitlab')) return ['fab', 'gitlab']
  return ['fab', 'github']
})

function openRepo() {
  if (props.repoUrl) {
    window.open(props.repoUrl, '_blank', 'noopener')
  }
}

const license = computed(() => '--')

const platformIcons = computed(() =>
  PLATFORMS.filter((p) => (props.publication.platforms ?? []).includes(p.value)).map((p) => ({
    value: p.value,
    name: p.name,
    icon: p.icon
  }))
)

const esrbEntry = computed(
  () => ESRB_RATINGS.find((e) => e.value === props.publication.esrbRating) ?? null
)

const typeIcon = computed<[string, string]>(() =>
  props.publication.type === 'videogame' ? ['fas', 'gamepad'] : ['fas', 'puzzle-piece']
)

const typeName = computed(() => {
  const found = APP_TYPES.find((t) => t.label === props.publication.type)
  return found?.name ?? props.publication.type
})

const formattedDownloads = computed(() => (props.publication.downloads ?? 0).toLocaleString())
</script>
