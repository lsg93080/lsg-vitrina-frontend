<template>
  <section class="lsg-card relative w-full overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img
        :src="publication.thumbnailUrl || defaultIMG"
        :alt="publication.title"
        class="h-full w-full scale-110 object-cover blur-2xl"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />
    </div>

    <div
      class="relative z-10 flex flex-col gap-6 px-6 py-8 md:flex-row md:gap-10 md:px-10 md:py-12"
    >
      <div class="hero-thumbnail-wrapper shrink-0 self-start">
        <img
          :src="publication.thumbnailUrl || defaultIMG"
          :alt="publication.title"
          class="hero-thumbnail h-[220px] w-auto rounded-lg object-cover shadow-lg md:h-[280px]"
          :style="{ viewTransitionName: `pub-thumb-${publication.repoId}` }"
        />
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <h1
          class="hero-title font-['Audiowide'] text-3xl font-bold text-white! md:text-5xl"
          :style="{ viewTransitionName: `pub-title-${publication.repoId}` }"
        >
          {{ publication.title }}
        </h1>

        <p class="text-sm text-[var(--text-color-light)]">
          {{ t('details.by') }}
          <span class="text-[var(--secondary-color)]">
            {{ authorName || publication.authorId }}
          </span>
        </p>

        <!-- Type badge + platforms row -->
        <div class="flex flex-wrap items-center gap-3">
          <Tag :value="typeName" severity="info" class="hero-type-badge">
            <template #icon>
              <font-awesome-icon
                :icon="['fas', publication.type === 'videogame' ? 'gamepad' : 'puzzle-piece']"
                class="mr-1"
              />
            </template>
          </Tag>
          <span v-if="publication.platforms?.length" class="flex items-center gap-2 text-white">
            <font-awesome-icon
              v-for="platform in publication.platforms"
              :key="platform"
              :icon="platformIcon(platform)"
              v-tooltip.top="platformName(platform)"
              class="text-lg transition-colors duration-200 hover:text-[var(--secondary-color)]"
            />
          </span>
        </div>

        <div v-if="publication.tags?.length" class="flex flex-wrap gap-2">
          <Chip
            v-for="tag in publication.tags"
            :key="tag"
            :label="tag"
            class="hero-chip text-xs capitalize"
          />
        </div>

        <!-- Rating + Downloads row -->
        <div class="flex flex-wrap items-center gap-6">
          <button
            v-if="publication.totalReviews && publication.totalReviews > 0"
            class="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0"
            @click="emit('scrollToReviews')"
          >
            <span class="text-2xl font-bold text-[var(--primary-color)]">
              {{ (publication.averageRating ?? 0).toFixed(1) }}
            </span>
            <Stars :rating="publication.averageRating" />
            <span class="text-sm text-[var(--text-color-light)]">
              ({{ publication.totalReviews }}
              {{ publication.totalReviews === 1 ? t('details.review') : t('details.reviews') }})
            </span>
          </button>
          <span v-else class="text-sm text-[var(--text-color-light)] italic">
            {{ t('details.notRated') }}
          </span>

          <span class="flex items-center gap-1.5 text-sm text-[var(--text-color-light)]">
            <font-awesome-icon :icon="['fas', 'download']" />
            {{ formatDownloads(publication.downloads) }} {{ t('details.downloads') }}
          </span>
        </div>

        <div v-if="esrbData" class="flex items-center gap-2">
          <img
            :src="esrbData.imageURL"
            :alt="esrbData.name"
            class="h-10 w-auto"
            v-tooltip.right="esrbData.name"
          />
          <span class="text-xs text-[var(--text-color-light)]">{{ esrbData.name }}</span>
        </div>

        <div class="mt-2 flex flex-wrap gap-3">
          <Button
            v-if="isOwner"
            :label="t('details.edit')"
            severity="secondary"
            variant="outlined"
            class="hero-btn-ghost"
            @click="emit('edit')"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'pen-to-square']" class="mr-2" />
            </template>
          </Button>
          <Button
            v-if="repoUrl"
            :label="t('details.goToRepo')"
            class="hero-btn-primary"
            @click="openRepo"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-2" />
            </template>
          </Button>
          <Button
            :label="t('details.report')"
            severity="secondary"
            variant="outlined"
            class="hero-btn-ghost"
            @click="emit('report')"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', 'flag']" class="mr-2" />
            </template>
          </Button>
          <Button
            :label="copied ? t('details.linkCopied') : t('details.share')"
            severity="secondary"
            variant="outlined"
            class="hero-btn-ghost"
            @click="sharePublication"
          >
            <template #icon>
              <font-awesome-icon :icon="['fas', copied ? 'check' : 'share-nodes']" class="mr-2" />
            </template>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import Stars from '@/components/common/Stars.vue'
import { PLATFORMS } from '@/catalogs/platforms'
import { ESRB_RATINGS } from '@/catalogs/esrbRatings'
import defaultIMG from '@/assets/defaultIMG.jpg'
import type { PublicationResponseDto } from '@/types/models/publication'
import type { PlatformValue } from '@/types/models/platform'

// i18n keys used:
// details.by, details.review, details.reviews, details.notRated,
// details.downloads, details.goToRepo, details.report, details.share

const { t } = useI18n()
const toast = useToast()
const copied = ref(false)

const props = defineProps<{
  publication: PublicationResponseDto
  repoUrl?: string
  authorName?: string | null
  isOwner?: boolean
}>()

const emit = defineEmits<{
  report: []
  scrollToReviews: []
  edit: []
}>()

const esrbData = computed(() => ESRB_RATINGS.find((r) => r.value === props.publication.esrbRating))

const typeName = computed(() => {
  const typeMap: Record<string, string> = {
    videogame: 'Videogame',
    extension: 'Extension'
  }
  return typeMap[props.publication.type] ?? props.publication.type
})

function platformIcon(platform: PlatformValue): string[] {
  const found = PLATFORMS.find((p) => p.value === platform)
  return found?.icon ?? ['fas', 'desktop']
}

function platformName(platform: PlatformValue): string {
  const found = PLATFORMS.find((p) => p.value === platform)
  return found?.name ?? platform
}

function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

function openRepo() {
  if (props.repoUrl) window.open(props.repoUrl, '_blank', 'noopener')
}

async function sharePublication() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: props.publication.title, url })
  } else {
    await navigator.clipboard.writeText(url)
    copied.value = true
    toast.add({ severity: 'success', summary: t('details.linkCopied'), life: 2500 })
    setTimeout(() => (copied.value = false), 2500)
  }
}
</script>

<style scoped>
.hero-title {
  text-shadow:
    0 0 10px var(--primary-color-50),
    0 0 20px var(--primary-color-30),
    0 0 40px var(--primary-color-15);
}

.hero-thumbnail-wrapper {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow:
    0 0 20px rgba(0, 0, 0, 0.5),
    0 0 8px var(--primary-color-20);
}

.hero-type-badge {
  --p-tag-info-background: var(--secondary-color);
  --p-tag-info-color: white;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.hero-chip {
  --p-chip-background: var(--primary-color-15);
  --p-chip-color: white;
  border: 1px solid var(--primary-color-30);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease-in-out;
}

.hero-chip:hover {
  --p-chip-background: var(--primary-color-35);
  box-shadow:
    0 0 8px var(--primary-color-40),
    0 0 16px var(--primary-color-20);
  border-color: var(--primary-color-60);
}

.hero-btn-primary {
  --p-button-primary-background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-color-dark)
  );
  --p-button-primary-border-color: var(--primary-color);
  --p-button-primary-hover-background: var(--primary-color);
  --p-button-primary-hover-border-color: var(--primary-color);
  box-shadow: 0 0 12px var(--primary-color-30);
  transition: all 0.3s ease-in-out;
}

.hero-btn-primary:hover {
  box-shadow:
    0 0 16px var(--primary-color-50),
    0 0 32px var(--primary-color-25);
}

.hero-btn-ghost {
  --p-button-outlined-secondary-border-color: rgba(255, 255, 255, 0.2);
  --p-button-outlined-secondary-color: #a5a5a5;
  --p-button-outlined-secondary-hover-background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease-in-out;
}

.hero-btn-ghost:hover {
  --p-button-outlined-secondary-border-color: var(--secondary-color);
  --p-button-outlined-secondary-color: white;
  box-shadow: 0 0 10px rgba(1, 138, 190, 0.3);
}
</style>
