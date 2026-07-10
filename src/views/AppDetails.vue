<template>
  <section class="main-contributions h-full scroll-smooth">
    <!-- Loading State: keeps thumbnail with view-transition-name so the morph animation lands -->
    <div v-if="loading" class="py-6">
      <div class="lsg-card relative w-full overflow-hidden">
        <div class="flex flex-col gap-6 px-6 py-8 md:flex-row md:gap-10 md:px-10 md:py-12">
          <div class="shrink-0 self-start overflow-hidden rounded-lg border-2 border-white/10">
            <img
              :src="defaultIMG"
              alt=""
              class="h-[220px] w-auto rounded-lg object-cover md:h-[280px]"
              :style="{ viewTransitionName: `pub-thumb-${repoId}` }"
            />
          </div>
          <div class="flex flex-1 flex-col items-start justify-center gap-4">
            <div
              class="h-10 w-64 animate-pulse rounded-lg bg-white/10"
              :style="{ viewTransitionName: `pub-title-${repoId}` }"
            />
            <div class="h-4 w-48 animate-pulse rounded bg-white/5" />
            <div class="h-4 w-32 animate-pulse rounded bg-white/5" />
            <div class="mt-4 flex items-center gap-3">
              <font-awesome-icon
                :icon="['fas', 'sync']"
                class="fa-spin text-[var(--primary-color)]"
                style="filter: drop-shadow(0 0 12px var(--primary-color-50))"
              />
              <p class="text-sm text-[var(--text-color-light)]">{{ t('details.loading') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="flex h-[60vh] flex-col items-center justify-center gap-4">
      <font-awesome-icon
        :icon="['fas', 'exclamation-triangle']"
        class="text-5xl text-[var(--primary-color)]"
      />
      <p class="text-lg text-[var(--text-color)]">{{ t('details.not-found') }}</p>
      <p class="text-sm text-[var(--text-color-light)]">{{ error }}</p>
      <Button :label="t('details.back-to-catalog')" @click="router.push({ name: 'Publications' })">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
        </template>
      </Button>
    </div>

    <div v-else-if="publication" class="py-6">
      <nav class="mb-6 flex items-center gap-2 text-sm text-[var(--text-color-light)]">
        <router-link
          :to="{ name: 'Publications' }"
          class="transition-colors duration-200 hover:text-[var(--primary-color)]"
        >
          {{ t('nav.catalog') }}
        </router-link>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-[0.6rem] opacity-50" />
        <router-link
          :to="{ name: 'Publications' }"
          class="transition-colors duration-200 hover:text-[var(--primary-color)]"
        >
          {{ t('nav.publications') }}
        </router-link>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-[0.6rem] opacity-50" />
        <span class="truncate text-[var(--text-color)]">{{ publication.title }}</span>
      </nav>

      <DetailsHero
        :publication="publication"
        :repo-url="publication.repoUrl || publicationDetails?.repoUrl"
        :author-name="authorName"
        :is-owner="isOwner"
        @report="showReportPopup = true"
        @scroll-to-reviews="scrollToReviews"
        @edit="
          () => {
            editPopupTab = 'app'
            showEditPopup = true
          }
        "
      />

      <div class="mt-8">
        <DetailsImageGallery :images="galleryImages" />
      </div>

      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div class="flex flex-col gap-8">
          <DetailsDescription
            :description="(publicationDetails?.repoDesc as string) || publication.shortDescription"
            :documentation="publicationDetails?.repoDoc"
            :release-notes="selectedRelease?.releaseNotes"
            :system-requirements="publicationDetails?.requirements"
          />

          <DetailsReleases
            ref="releasesRef"
            :repo-id="repoId"
            :selected-release-id="selectedRelease?.id"
            :is-owner="isOwner"
            @select-release="onSelectRelease"
            @add-release="
              () => {
                editPopupTab = 'releases'
                showEditPopup = true
              }
            "
          />

          <div v-if="pendingAssignment && !verdictSubmitted" ref="verdictSectionRef">
            <DetailsVerdictSection
              :assignment-id="pendingAssignment.id"
              :repo-url="publication.repoUrl || (publicationDetails?.repoUrl as string)"
              @verdict-submitted="onVerdictSubmitted"
            />
          </div>

          <div ref="reviewSectionRef">
            <DetailsReviewSection
              :repo-id="repoId"
              :releases="releases"
              :selected-release="selectedRelease"
              :is-owner="isOwner"
              @select-release="onSelectRelease"
              @review-submitted="onReviewSubmitted"
              @reviews-updated="onReviewsUpdated"
            />
          </div>
        </div>

        <!-- Right Column (sticky sidebar) -->
        <div class="lg:sticky lg:top-4 lg:self-start">
          <DetailsInfoSidebar
            :publication="publication"
            :repo-url="publication.repoUrl || publicationDetails?.repoUrl"
            :author-name="authorName"
            :rating-distribution="ratingDistribution"
            :can-review="canReview"
            @scroll-to-reviews="scrollToReviews"
          />
        </div>
      </div>

      <ReportPopup v-model="showReportPopup" :repo-details="{ repoId: publication.repoId }" />

      <!-- Edit Popup (owner only) -->
      <EditAppPopup
        v-if="isOwner && publicationAsRepository"
        v-model:show-edit-app-popup="showEditPopup"
        v-model:apps="editableApps"
        :app="publicationAsRepository"
        :initial-tab="editPopupTab"
        @updated="pendingRefresh = true"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import DetailsHero from '@/components/details/DetailsHero.vue'
import DetailsImageGallery from '@/components/details/DetailsImageGallery.vue'
import DetailsInfoSidebar from '@/components/details/DetailsInfoSidebar.vue'
import DetailsDescription from '@/components/details/DetailsDescription.vue'
import DetailsReleases from '@/components/details/DetailsReleases.vue'
import DetailsReviewSection from '@/components/details/DetailsReviewSection.vue'
import DetailsVerdictSection from '@/components/details/DetailsVerdictSection.vue'
import ReportPopup from '@/components/publications/ReportPopup.vue'
import EditAppPopup from '@/components/my_apps/EditAppPopup.vue'
import defaultIMG from '@/assets/defaultIMG.jpg'
import { getPublicationFull } from '@/api/publications'
import { getPublicationDetailsByRepoId } from '@/api/publicationDetails'
import { getContributorByUserId } from '@/api/contributors'
import { getMyAssignmentForPublication } from '@/api/moderation'
import type { ReviewerAssignment } from '@/api/moderation'
import { useStore } from 'vuex'
import { key } from '@/store/index'
import type { PublicationResponseDto } from '@/types/models/publication'
import type { Release } from '@/types/models/release'
import type { ReviewResponseDto } from '@/types/models/review'
import type { Repository } from '@/types/models/repository'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore(key)

const publication = ref<PublicationResponseDto | null>(null)
const publicationDetails = ref<Record<string, unknown> | null>(null)
const authorName = ref<string | null>(null)
const selectedRelease = ref<Release | null>(null)
const releases = ref<Release[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showReportPopup = ref(false)
const showEditPopup = ref(false)
const editPopupTab = ref('app')

const isOwner = computed(
  () => !!publication.value && publication.value.authorId === store.state.platformUserId
)

const canReview = computed(() => {
  if (!store.state.isLogged || isOwner.value || !selectedRelease.value) return false
  return !loadedReviews.value.some((r) => r.authorId === store.state.platformUserId)
})

const pendingRefresh = ref(false)

watch(showEditPopup, (visible) => {
  if (!visible) {
    releasesRef.value?.refresh()
    if (pendingRefresh.value) {
      pendingRefresh.value = false
      fetchData()
    }
  }
})

// Minimal Repository shape required by EditAppPopup
const publicationAsRepository = computed<Repository | null>(() => {
  if (!publication.value) return null
  return {
    repoId: publication.value.repoId as unknown as number,
    title: publication.value.title,
    thumbnailUrl: publication.value.thumbnailUrl ?? '',
    pubName: publication.value.title,
    imgUrl: publication.value.thumbnailUrl ?? '',
    contrId: publication.value.authorId,
    ownerId: 0,
    author: publication.value.authorId,
    pubType: { id: 0, name: publication.value.type, label: publication.value.type },
    releasesURL: '',
    downloads: publication.value.downloads,
    lastStatus: {} as Repository['lastStatus'],
    lastReleaseDate: new Date(publication.value.updatedAt),
    tags: (publication.value.tags ?? []).map((name, i) => ({ id: i, name })),
    repoDetails: {} as Repository['repoDetails'],
    totalComments: 0,
    totalRating: publication.value.totalRating,
    ESRB: {} as Repository['ESRB'],
    platforms: []
  }
})

// Wraps the single publication in an array so EditAppPopup can update it in place
const editableApps = ref<Repository[]>([])

const reviewSectionRef = ref<HTMLElement | null>(null)
const verdictSectionRef = ref<HTMLElement | null>(null)
const releasesRef = ref<InstanceType<typeof DetailsReleases> | null>(null)
const loadedReviews = ref<ReviewResponseDto[]>([])
const pendingAssignment = ref<ReviewerAssignment | null>(null)
const verdictSubmitted = ref(false)

const repoId = computed(() => (route.query.repoId as string) || '')

const galleryImages = computed<string[]>(() => {
  const thumbnailUrl = publication.value?.thumbnailUrl
  // Thumbnail is already shown in the hero, so exclude it from the gallery
  return (publicationDetails.value?.images ?? []).filter((url) => url !== thumbnailUrl)
})

const ratingDistribution = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of loadedReviews.value) {
    const s = Math.round(r.rating)
    if (s >= 1 && s <= 5) counts[s]++
  }
  return [1, 2, 3, 4, 5].map((star) => ({ star, count: counts[star] }))
})

async function onReviewsUpdated(reviews: ReviewResponseDto[]) {
  loadedReviews.value = reviews
  // Refresh publication to sync averageRating after edit/delete
  if (!repoId.value) return
  try {
    const response = await getPublicationFull(repoId.value)
    const fullData = response.data
    if (fullData && 'publication' in fullData) {
      publication.value = (fullData as Record<string, unknown>)
        .publication as PublicationResponseDto
    } else {
      publication.value = fullData
    }
  } catch {
    // Non-fatal, local reviews already updated
  }
}

function onSelectRelease(release: Release) {
  selectedRelease.value = release
  // Sync the full releases list the first time a release is selected (DetailsReleases loads async)
  if (releasesRef.value?.releases?.length) {
    releases.value = releasesRef.value.releases
  }
}

function scrollToReviews() {
  reviewSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onVerdictSubmitted() {
  verdictSubmitted.value = true
  pendingAssignment.value = null
}

async function onReviewSubmitted() {
  // Refresh publication to get updated rating after cascade
  if (!repoId.value) return
  try {
    const response = await getPublicationFull(repoId.value)
    const fullData = response.data
    if (fullData && 'publication' in fullData) {
      publication.value = (fullData as Record<string, unknown>)
        .publication as PublicationResponseDto
    } else {
      publication.value = fullData
    }
  } catch {
    // Non-fatal, the local state is already updated in the review section
  }
}

async function fetchData() {
  const id = repoId.value
  if (!id) {
    error.value = 'No publication ID provided'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const [pubResponse, detailsResponse] = await Promise.allSettled([
      getPublicationFull(id),
      getPublicationDetailsByRepoId(id)
    ])

    if (pubResponse.status === 'fulfilled') {
      const fullData = pubResponse.value.data
      // /publications/full/:repoId returns { publication, details }
      if (fullData && 'publication' in fullData) {
        publication.value = (fullData as Record<string, unknown>)
          .publication as PublicationResponseDto
        publicationDetails.value = (fullData as Record<string, unknown>).details as Record<
          string,
          unknown
        > | null
      } else {
        publication.value = fullData
      }
    } else {
      throw new Error('Publication not found')
    }

    // Fallback: also try the legacy details endpoint
    if (!publicationDetails.value && detailsResponse.status === 'fulfilled') {
      publicationDetails.value = detailsResponse.value.data
    }

    // Resolve author display name from authorId
    if (publication.value?.authorId) {
      try {
        const { data: contributor } = await getContributorByUserId(publication.value.authorId)
        authorName.value = contributor.contrInfo?.username ?? null
      } catch {}
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load publication'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()

  // Sync releases from the DetailsReleases component after it loads
  if (releasesRef.value?.releases?.length) {
    releases.value = releasesRef.value.releases
    if (!selectedRelease.value) {
      selectedRelease.value = releases.value[0] ?? null
    }
  }

  // Check if the logged-in user has a pending moderation assignment for this publication
  if (store.state.isLogged && repoId.value) {
    try {
      const res = await getMyAssignmentForPublication(repoId.value)
      const assignments = res.data.data
      const pending = assignments.find((a) => a.status === 'pending')
      if (pending) {
        pendingAssignment.value = pending
        // Auto-scroll to verdict section if URL has verdict query or hash
        const wantsVerdict =
          route.query.verdict === 'true' || window.location.hash.includes('#verdict')
        if (wantsVerdict) {
          await nextTick()
          verdictSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    } catch {
      // Non-fatal, user simply has no assignment
    }
  }
})
</script>
