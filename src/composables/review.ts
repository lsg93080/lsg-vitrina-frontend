import { ref } from 'vue'
import { deleteReview, getReviewsByAuthor, updateReview } from '@/api/reviews'
import type { ReviewResponseDto } from '@/types/models/review'

export function useReview() {
  const reviews = ref<ReviewResponseDto[]>([])

  const fetchUserReviews = async (userId: string) => {
    const response = await getReviewsByAuthor(userId)
    reviews.value = response.data
  }

  const updateUserReview = async (id: string, newReviewData: Partial<ReviewResponseDto>) => {
    if (!id) {
      throw new Error('Review ID is required for editing')
    }
    try {
      const response = await updateReview(id, newReviewData)
      if (response.status) {
        const index = reviews.value.findIndex((r) => r.id === id)
        if (index !== -1) {
          reviews.value[index] = { ...reviews.value[index], ...newReviewData } as ReviewResponseDto
        }
      } else {
        throw new Error('Failed to update review')
      }
    } catch {
      // Update failed, caller handles UX feedback
    }
  }

  const deleteUserReview = async (id: string) => {
    try {
      const response = await deleteReview(id)
      if (response.status) {
        const index = reviews.value.findIndex((r) => r.id === id)
        if (index !== -1) {
          reviews.value = reviews.value.filter((review) => review.id !== id)
        }
      } else {
        throw new Error('Failed to delete review')
      }
    } catch {
      // Caller handles UX feedback
    }
  }

  return {
    reviews,
    fetchUserReviews,
    updateUserReview,
    deleteUserReview
  }
}
