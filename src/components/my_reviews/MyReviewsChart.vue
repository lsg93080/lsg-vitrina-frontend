<template>
  <section class="chart">
    <header class="pt-4 pb-2">
      <h2>Review Ratings (%)</h2>
      <p>{{ totalReviews }} Total Reviews</p>
      <p class="text-sm">Average Rating: {{ average.toFixed(2) }} &#9733;</p>
    </header>
    <PieChart
      :key="theme"
      :library="pieLibrary"
      :data="[
        ['&#9733;', count[0]],
        ['&#9733;&#9733;', count[1]],
        ['&#9733;&#9733;&#9733;', count[2]],
        ['&#9733;&#9733;&#9733;&#9733;', count[3]],
        ['&#9733;&#9733;&#9733;&#9733;&#9733;', count[4]]
      ]"
      :messages="{ empty: t('status.no-data') }"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChartTheme } from '@/composables/useChartTheme'
import PieChart from '@/components/common/PieChart.vue'
import type { ReviewResponseDto } from '@/types/models/review'

const { t } = useI18n()
const { theme, pieLibrary } = useChartTheme()

const reviews = defineModel({
  type: Array<ReviewResponseDto>,
  required: true
})

const count = ref<number[]>([0, 0, 0, 0, 0])
const totalReviews = computed(() => reviews.value.length)
const average = computed(() => {
  const total = reviews.value.reduce((sum, review) => sum + review.rating, 0)
  return totalReviews.value ? total / totalReviews.value : 0
})

onBeforeMount(() => {
  count.value = [0, 0, 0, 0, 0]
  reviews.value.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      count.value[review.rating - 1]!++
    }
  })
})
</script>
<style scoped></style>
