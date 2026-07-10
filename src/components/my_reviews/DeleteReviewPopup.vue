<template>
  <Dialog
    v-model:visible="showDeleteReviewPopup"
    modal
    :draggable="false"
    :header="t('contributions.action.delete-review')"
    :dismissableMask="true"
    contentClass="flex items-center justify-center h-full"
  >
    <div
      v-if="!showMessage"
      class="flex h-full w-[90vw] max-w-[350px] flex-col items-center justify-center gap-4 text-[var(--text-color)]"
    >
      <p class="text-center">{{ t('contributions.action.confirm-delete-review') }}</p>
      <p class="text-center text-sm font-semibold">"{{ review.title }}"</p>
      <div class="flex gap-2">
        <Button
          data-test="delete-review-button"
          :label="t('contributions.delete')"
          severity="danger"
          @click="onDeleteReview()"
        />
      </div>
    </div>
    <Message v-if="showMessage" :severity="message?.severity">{{ message?.text }}</Message>
  </Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ReviewResponseDto } from '@/types/models/review'
import { useReview } from '@/composables/review'
import { usePopupMessage } from '@/composables/popupMessage'

const { t } = useI18n()

const props = defineProps<{
  review: ReviewResponseDto
}>()

const review = ref(props.review)

const { deleteUserReview } = useReview()
const { message, showMessage, setMessage } = usePopupMessage()

const showDeleteReviewPopup = defineModel('showDeleteReviewPopup', {
  type: Boolean
})
const reviews = defineModel('reviews', {
  type: Array as () => ReviewResponseDto[]
})

const onDeleteReview = async () => {
  try {
    await deleteUserReview(review.value.id)
    if (!reviews.value) return
    const index = reviews.value.findIndex((r) => r.id === review.value.id)
    if (index !== -1) {
      reviews.value.splice(index, 1)
    }
    setMessage(t('contributions.message.delete-review-success'), 'success')
  } catch {
    setMessage(t('contributions.message.delete-review-failure'), 'error')
  }
}
</script>
<style scoped></style>
