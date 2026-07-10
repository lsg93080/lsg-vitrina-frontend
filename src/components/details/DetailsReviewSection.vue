<template>
  <DetailsSectionCard :title="t('details.reviews-title')">
    <div v-if="isLogged" class="mb-6">
      <h4 class="mb-3 text-sm font-semibold tracking-wide text-[var(--text-color-light)] uppercase">
        {{ t('details.write-review') }}
      </h4>

      <template v-if="props.isOwner">
        <div class="flex flex-col items-center gap-2 py-6 text-[var(--text-color-light)]">
          <font-awesome-icon :icon="['fas', 'user-pen']" class="text-2xl opacity-40" />
          <p class="text-sm">{{ t('details.cannot-review-own') }}</p>
        </div>
      </template>

      <template v-else-if="!props.selectedRelease">
        <div class="flex flex-col items-center gap-2 py-6 text-[var(--text-color-light)]">
          <font-awesome-icon
            :icon="['fas', props.releases.length === 0 ? 'box-open' : 'hand-pointer']"
            class="text-2xl opacity-40"
          />
          <p class="text-sm">
            {{
              props.releases.length === 0
                ? t('details.no-releases-to-review')
                : t('details.select-release-first')
            }}
          </p>
        </div>
      </template>

      <template v-else-if="hasReviewed">
        <div class="flex flex-col items-center gap-2 py-6 text-[var(--text-color-light)]">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="text-2xl opacity-40" />
          <p class="text-sm">{{ t('details.already-reviewed') }}</p>
        </div>
      </template>

      <template v-else>
        <div v-if="!showForm" class="lsg-card p-4">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-color-light)] transition-all duration-200 hover:border-[var(--primary-color)]/40 hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]"
            @click="openForm"
          >
            <font-awesome-icon :icon="['fas', 'pen']" />
            {{ t('details.write-review') }}
          </button>
        </div>

        <div v-else ref="formRef" class="lsg-card p-5">
          <div
            class="mb-4 flex items-center gap-2 rounded-lg border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5 px-3 py-2"
          >
            <font-awesome-icon :icon="['fas', 'tag']" class="text-xs text-[var(--primary-color)]" />
            <span class="text-xs text-[var(--text-color-light)]">
              {{ t('details.reviewing-release') }}:
            </span>
            <span class="text-xs font-semibold text-white">
              {{ props.selectedRelease.version }} / {{ props.selectedRelease.title }}
            </span>
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-[var(--text-color-light)]">
              {{ t('details.choose-rating') }}
            </label>
            <Rating v-model="form.rating" :cancel="false" class="review-rating" />
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-[var(--text-color-light)]">
              {{ t('details.type-title') }}
            </label>
            <InputText
              v-model="form.title"
              :placeholder="t('details.review-title-placeholder')"
              class="w-full"
              :invalid="submitted && !form.title.trim()"
            />
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-[var(--text-color-light)]">
              {{ t('details.type-body') }}
            </label>
            <Textarea
              v-model="form.comment"
              :placeholder="t('details.review-body-placeholder')"
              rows="4"
              class="w-full"
              :invalid="submitted && !form.comment"
              autoResize
            />
          </div>

          <div class="flex items-center justify-end gap-2">
            <Button :label="t('actions.cancel')" severity="secondary" @click="cancelForm" />
            <Button
              :label="t('details.submit-review')"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              <template #icon>
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="mr-2" />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </div>

    <div class="mb-6 h-px bg-white/10" />

    <div>
      <h4 class="mb-3 text-sm font-semibold tracking-wide text-[var(--text-color-light)] uppercase">
        {{ t('details.reviews-list') }}
        <span v-if="reviews.length > 0" class="ml-1 text-xs font-normal opacity-70">
          ({{ reviews.length }})
        </span>
      </h4>

      <LoadingState v-if="loadingReviews" size="sm" />

      <EmptyState
        v-else-if="reviews.length === 0 && !showForm"
        :icon="['fas', 'comment-slash']"
        :title="t('details.no-reviews')"
        :description="t('details.be-first-to-review')"
        :primary-action="
          isLogged && !props.isOwner && props.selectedRelease && !hasReviewed
            ? { label: t('details.write-review'), icon: ['fas', 'pen'], action: openForm }
            : !isLogged
              ? {
                  label: t('restricted.sign-in'),
                  icon: ['fas', 'arrow-right'],
                  action: goToLogin
                }
              : undefined
        "
      />

      <TransitionGroup v-else name="review-list" tag="div" class="flex flex-col gap-3">
        <div
          v-for="review in sortedReviews"
          :key="review.id"
          class="review-card lsg-card p-4"
          :class="
            review.authorId === platformUserId
              ? 'border-[var(--primary-color)]/30 shadow-[0_0_12px_rgba(250,94,21,0.12)]'
              : 'border-white/10'
          "
        >
          <div class="mb-2 flex items-center gap-3">
            <div class="relative shrink-0">
              <img
                v-if="review.authorId === platformUserId && currentUserPhoto"
                :src="currentUserPhoto"
                :alt="currentUserName ?? review.authorId"
                class="h-9 w-9 rounded-full object-cover ring-2"
                :class="
                  review.authorId === platformUserId
                    ? 'ring-[var(--primary-color)]/50'
                    : 'ring-white/10'
                "
              />
              <div
                v-else
                class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                :class="
                  review.authorId === platformUserId
                    ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]'
                    : 'bg-white/10 text-white/70'
                "
              >
                {{ getInitials(review.authorName) }}
              </div>
              <div
                v-if="review.authorId === platformUserId"
                class="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--primary-color)] text-[6px] text-white"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </div>
            </div>

            <!-- Name + date -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-[var(--text-color-light)]">
                {{
                  review.authorId === platformUserId
                    ? (currentUserName ?? t('details.review-you'))
                    : review.authorName
                }}
              </p>
              <p class="text-left text-xs text-[var(--text-color-light)]">
                {{ formatDate(review.createdAt, { lang: locale }) }}
              </p>
            </div>

            <!-- Edit / Delete buttons for own reviews -->
            <div
              v-if="review.authorId === platformUserId"
              class="flex shrink-0 items-center gap-1.5"
            >
              <button
                v-tooltip.top="t('details.edit-your-review')"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--primary-color)]/30 bg-[var(--primary-color)]/10 text-[var(--primary-color)] transition-all duration-200 hover:border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/20"
                @click="openEditPopup(review)"
              >
                <font-awesome-icon :icon="['fas', 'pen']" class="text-xs" />
              </button>
              <button
                v-tooltip.top="t('details.delete-your-review')"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/20"
                @click="openDeletePopup(review)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="text-xs" />
              </button>
            </div>
          </div>

          <div class="mb-2 flex items-center gap-2">
            <span class="text-sm font-bold text-[var(--primary-color)]">{{ review.rating }}</span>
            <Stars :rating="review.rating" />
          </div>

          <p
            v-if="review.title"
            class="mb-1 text-left text-sm font-semibold text-[var(--text-color)]"
          >
            {{ review.title }}
          </p>
          <p class="text-left text-sm leading-relaxed text-[var(--text-color-light)]">
            {{ review.comment }}
          </p>
        </div>
      </TransitionGroup>
    </div>

    <EditReviewPopup
      v-if="selectedReview"
      v-model:showEditReviewPopup="showEditPopup"
      v-model:reviews="reviews"
      :review="selectedReview"
    />
    <DeleteReviewPopup
      v-if="selectedReview"
      v-model:showDeleteReviewPopup="showDeletePopup"
      v-model:reviews="reviews"
      :review="selectedReview"
    />
  </DetailsSectionCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import DetailsSectionCard from '@/components/details/DetailsSectionCard.vue'
import Stars from '@/components/common/Stars.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EditReviewPopup from '@/components/my_reviews/EditReviewPopup.vue'
import DeleteReviewPopup from '@/components/my_reviews/DeleteReviewPopup.vue'
import { useToast } from 'primevue/usetoast'
import { getReviewsByRelease, createReview } from '@/api/reviews'
import { formatDate } from '@/utils/formatDate'
import { key } from '@/store/index'
import type { Release } from '@/types/models/release'
import type { ReviewResponseDto } from '@/types/models/review'

interface Props {
  repoId: string
  releases: Release[]
  selectedRelease?: Release | null
  isOwner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedRelease: null,
  isOwner: false
})

const emit = defineEmits<{
  selectRelease: [release: Release]
  reviewSubmitted: []
  reviewsUpdated: [reviews: ReviewResponseDto[]]
}>()

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore(key)
const toast = useToast()

const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect_uri: `${window.location.pathname}#${route.fullPath}` }
  })
}

const isLogged = computed(() => store.state.isLogged)
const platformUserId = computed(() => store.state.platformUserId)
const currentUserName = computed(() => store.state.appUserCredentials.displayName)
const currentUserPhoto = computed(() => store.state.appUserCredentials.photoUrl)

const reviews = ref<ReviewResponseDto[]>([])
const loadingReviews = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const showForm = ref(false)
const formRef = ref<HTMLElement | null>(null)

const selectedReview = ref<ReviewResponseDto | null>(null)
const showEditPopup = ref(false)
const showDeletePopup = ref(false)

const form = ref({
  rating: 0,
  title: '',
  comment: ''
})

const canSubmit = computed(() => {
  return form.value.rating > 0 && form.value.title.trim() !== '' && form.value.comment.trim() !== ''
})

const hasReviewed = computed(() => {
  if (!platformUserId.value) return false
  return reviews.value.some((r) => r.authorId === platformUserId.value)
})

// Own review always first
const sortedReviews = computed(() => {
  if (!platformUserId.value) return reviews.value
  return [...reviews.value].sort((a, b) => {
    if (a.authorId === platformUserId.value) return -1
    if (b.authorId === platformUserId.value) return 1
    return 0
  })
})

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

function openEditPopup(review: ReviewResponseDto) {
  selectedReview.value = review
  showEditPopup.value = true
}

function openDeletePopup(review: ReviewResponseDto) {
  selectedReview.value = review
  showDeletePopup.value = true
}

function openForm() {
  showForm.value = true
  nextTick(() => {
    formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

function cancelForm() {
  showForm.value = false
  form.value = { rating: 0, title: '', comment: '' }
  submitted.value = false
}

async function fetchReviews(releaseId: string) {
  loadingReviews.value = true
  try {
    const response = await getReviewsByRelease(props.repoId, releaseId)
    reviews.value = response.data.data
    emit('reviewsUpdated', reviews.value)
  } catch {
    reviews.value = []
    emit('reviewsUpdated', [])
  } finally {
    loadingReviews.value = false
  }
}

async function handleSubmit() {
  submitted.value = true
  if (!canSubmit.value || !props.selectedRelease) return

  submitting.value = true
  try {
    await createReview({
      repoId: props.repoId,
      releaseId: props.selectedRelease.id,
      rating: form.value.rating,
      title: form.value.title.trim(),
      comment: form.value.comment.trim()
    })
    cancelForm()
    emit('reviewSubmitted')
    await fetchReviews(props.selectedRelease.id)
    toast.add({ severity: 'success', summary: t('details.review-success'), life: 3000 })
  } catch (error) {
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      t('details.review-error')
    toast.add({ severity: 'error', summary: msg, life: 4000 })
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.selectedRelease,
  (release) => {
    if (release) {
      fetchReviews(release.id)
    } else {
      reviews.value = []
    }
  },
  { immediate: true }
)

// Propagate changes from edit/delete popups to the parent (rating card, etc.)
watch(reviews, (updated) => emit('reviewsUpdated', updated), { deep: true })

defineExpose({ reviews })
</script>

<style scoped>
.review-rating :deep(.p-rating-icon) {
  color: var(--primary-color);
  transition: color 0.2s ease;
}

.review-rating :deep(.p-rating-icon.p-rating-icon-active) {
  color: var(--primary-color);
}

.review-list-enter-active,
.review-list-leave-active {
  transition: all 0.3s ease;
}

.review-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.review-list-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
