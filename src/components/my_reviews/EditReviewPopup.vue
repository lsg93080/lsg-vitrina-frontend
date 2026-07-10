<template>
  <Dialog
    v-model:visible="showEditReviewPopup"
    modal
    :draggable="false"
    :header="t('contributions.action.edit-review')"
    :dismissableMask="true"
    contentClass="flex items-center justify-center h-full"
  >
    <div
      v-if="!showMessage"
      class="flex h-full w-[90vw] max-w-[600px] flex-col items-center justify-center gap-4 text-[var(--text-color)]"
    >
      <section class="flex h-auto w-full flex-col items-start">
        <label for="review-rating">{{ t(`contributions.action.change-rating`) }}</label>
        <div class="mb-2 flex items-center gap-2">
          <Rating
            id="review-rating"
            name="review-rating"
            v-model="reviewRating"
            :stars="5"
            class="h-9"
          />
          <span>{{ t(`details.${reviewRating}-stars`) }}</span>
        </div>
        <label for="review-title">{{ t(`contributions.action.change-title`) }}</label>
        <InputText
          id="review-title"
          name="review-title"
          type="text"
          class="mb-3"
          v-model="reviewTitle"
          :placeholder="t('contributions.action.change-title-placeholder')"
        />
        <label for="review-body">{{ t(`contributions.action.change-body`) }}</label>
        <Textarea
          name="review-body"
          v-model="reviewComment"
          id="review-body"
          rows="5"
          :style="{ resize: 'none' }"
          :placeholder="t('contributions.action.change-body-placeholder')"
        />
      </section>
      <footer>
        <Button
          :label="t('contributions.update')"
          data-test="update-review-button"
          @click="onUpdateReview()"
        />
      </footer>
    </div>
    <Message v-if="showMessage" :severity="message?.severity">{{ message?.text }}</Message>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReview } from '@/composables/review'
import { usePopupMessage } from '@/composables/popupMessage'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Rating from 'primevue/rating'
import Message from 'primevue/message'
import type { ReviewResponseDto } from '@/types/models/review'

const { t } = useI18n()

const props = defineProps<{
  review: ReviewResponseDto
}>()

const review = ref(props.review)

const reviewRating = ref<number>(review.value.rating)
const reviewTitle = ref<string>(review.value.title)
const reviewComment = ref<string>(review.value.comment)

const { updateUserReview } = useReview()
const { message, showMessage, setMessage, reset } = usePopupMessage()

// Sync form fields when the review prop changes (reopen with updated data)
watch(
  () => props.review,
  (r) => {
    review.value = r
    reviewRating.value = r.rating
    reviewTitle.value = r.title
    reviewComment.value = r.comment
    reset()
  }
)

const showEditReviewPopup = defineModel('showEditReviewPopup', {
  type: Boolean
})
const reviews = defineModel('reviews', {
  type: Array as () => ReviewResponseDto[]
})

const onUpdateReview = async () => {
  const updatedReview: Partial<ReviewResponseDto> = {
    rating: reviewRating.value,
    title: reviewTitle.value,
    comment: reviewComment.value
  }
  try {
    await updateUserReview(review.value.id, updatedReview)
    if (!reviews.value) return
    const index = reviews.value.findIndex((r) => r.id === review.value.id)
    if (index !== -1) {
      reviews.value[index] = {
        ...reviews.value[index],
        ...updatedReview
      } as ReviewResponseDto
    }
    setMessage(t('contributions.message.edit-review-success'), 'success')
  } catch {
    setMessage(t('contributions.message.edit-review-failure'), 'error')
  }
}
</script>
<style scoped></style>
