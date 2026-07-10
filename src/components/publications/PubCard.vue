<template>
  <div class="app-div relative cursor-pointer flex-col overflow-hidden" @click="toggleDetails()">
    <h2
      class="line-clamp-2 !cursor-pointer self-start hover:text-[var(--primary-color)] hover:underline"
      :style="{ viewTransitionName: `pub-title-${repository.repoId}` }"
    >
      {{ repository.title }}
    </h2>
    <div class="flex w-full items-start justify-start gap-1 pb-2">
      <Chip :label="repository.type" :class="['text-xs leading-1 capitalize', typeChipClass]" />
      <Chip
        v-for="tag in repository.tags"
        :key="tag"
        :label="tag"
        class="text-xs leading-1 capitalize"
        @click.stop="changeTag(tag)"
      />
    </div>
    <Divider class="!my-2" />
    <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <button
        class="relative flex h-[160px] w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[5px] sm:aspect-video sm:h-[138px] sm:w-auto"
        @click="toggleDetails()"
      >
        <img
          class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          :src="repository.thumbnailUrl || defaultIMG"
          alt=""
          :loading="isAboveFold ? 'eager' : 'lazy'"
          :fetchpriority="isAboveFold ? 'high' : 'auto'"
          :style="{ viewTransitionName: `pub-thumb-${repository.repoId}` }"
        />
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent"
        />
      </button>
      <div class="info-div">
        <div class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
          <span class="label">{{ t('store.app-info.date') }}</span>
          <span class="col-span-1">{{
            repository.createdAt
              ? formatDate(repository.createdAt.toString(), { lang: store.state.lang })
              : '--'
          }}</span>
          <span class="label">{{ t('store.app-info.reviews') }}</span>
          <span class="col-span-1">{{ repository.totalReviews ?? 0 }}</span>
          <span class="label">{{ t('store.app-info.platforms') }}</span>
          <div class="col-span-1 space-x-2">
            <font-awesome-icon
              v-for="platform in repository.platforms"
              :key="platform"
              :icon="platformIcon(platform)"
              v-tooltip.top="platform.toUpperCase()"
              class="cursor-default"
            />
          </div>
          <span class="label">{{ t('store.app-info.rating') }}</span>
          <span class="col-span-1 flex items-center gap-2">
            <template v-if="repository.totalReviews === 0">
              <Tag
                data-test="rating-paragraph"
                :value="t('contr-card.not-rated')"
                severity="secondary"
              />
            </template>
            <template v-else>
              <strong data-test="rating-paragraph" class="text-base">
                {{ repository.averageRating.toFixed(2) }}
              </strong>
              <Rating
                :value="repository.averageRating"
                :readonly="true"
                :cancel="false"
                :stars="5"
              />
            </template>
          </span>
          <span class="label">{{ t('store.app-info.status') }}</span>
          <span class="col-span-1">
            <Tag
              v-if="repository.status"
              :value="repository.status.toUpperCase()"
              :severity="statusSeverity"
            />
            <span v-else>--</span>
          </span>
        </div>
      </div>
      <div class="actions-div">
        <Button @click.stop="showReportPopup = true" v-tooltip.left="'Report'" variant="outlined">
          <font-awesome-icon :icon="['fas', 'flag']" />
        </Button>
      </div>
      <ReportPopup v-model="showReportPopup" :repoDetails="repository" />
    </div>
    <font-awesome-icon
      class="figure absolute right-0 z-[-1] !h-[200%] -rotate-15 text-[var(--primary-color)] opacity-20"
      :icon="repository.type === 'videogame' ? ['fas', 'gamepad'] : ['fas', 'puzzle-piece']"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import { useRouter } from 'vue-router'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import ReportPopup from '@/components/publications/ReportPopup.vue'
import { formatDate } from '@/utils/formatDate'
import defaultIMG from '@/assets/defaultIMG.jpg'
import type { PublicationResponseDto } from '@/types/models/publication'

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()

const props = defineProps<{ repository: PublicationResponseDto; index?: number }>()
const emit = defineEmits(['on-search'])

const showReportPopup = ref(false)

// First cards are above the fold: load eagerly with high priority for LCP
const ABOVE_FOLD_COUNT = 2
const isAboveFold = computed(() => (props.index ?? Infinity) < ABOVE_FOLD_COUNT)

const TYPE_CHIP_CLASS: Record<string, string> = {
  videogame: '!bg-[var(--secondary-color)]',
  extension: '!bg-purple-950'
}
const typeChipClass = computed(
  () => TYPE_CHIP_CLASS[props.repository.type] ?? '!bg-[var(--secondary-color)]'
)

const STATUS_SEVERITY: Record<string, string> = {
  active: 'success',
  suspended: 'danger',
  draft: 'secondary'
}
const statusSeverity = computed(() => STATUS_SEVERITY[props.repository.status ?? ''] ?? 'secondary')

// Maps backend platform enum values to FontAwesome icons
const PLATFORM_ICONS: Record<string, string[]> = {
  windows: ['fab', 'windows'],
  linux: ['fab', 'linux'],
  macos: ['fab', 'apple'],
  android: ['fab', 'android']
}

function platformIcon(platform: string): string[] {
  return PLATFORM_ICONS[platform] ?? ['fas', 'desktop']
}

function toggleDetails() {
  const to = { name: 'Details', query: { repoId: props.repository.repoId } }

  if (document.startViewTransition) {
    document.startViewTransition(() => router.push(to))
  } else {
    router.push(to)
  }
}

function changeTag(value: string) {
  store.commit('mutateTag', value)
  store.commit('mutateQuery', { ...store.state.filterQuery, selectedTag: value })
  emit('on-search')
}
</script>
<style scoped>
.app-div {
  background-color: var(--surface-overlay);
  border: 1px solid var(--border-color-subtle);
  color: var(--text-color);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 5px;
  &:hover {
    background-color: var(--surface-raised);
    border-color: var(--primary-color-dark);
    transition: all 0.5s;
    .figure {
      transform: scale(1.1);
    }
  }
}

.figure {
  transition: all 0.5s;
}

span {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4rem;
}

.label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-color-light);
  align-self: center;
}

:has(.clickme:hover) {
  border-color: var(--primary-color);
  transition: all 0.3s;
}

.info-div {
  flex-grow: 1;
  text-align: left;
}

.actions-div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--primary-color);
  place-self: end;
}

.actions-div > * {
  cursor: pointer;
}

:global([data-theme='light']) {
  .app-div {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: var(--primary-color);
  }
}
</style>
